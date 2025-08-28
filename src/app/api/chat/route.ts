import { prisma } from '@/lib/prisma';
import { GetEmbedding, generateResponse } from '@/lib/gemini';
import { cosineSimilarity } from '@/lib/similarity';
import { saveMessageWithEmbedding } from '@/lib/saveMessage';

export async function POST(req: Request) {
    console.log('🟢 POST /api/chat được gọi');
    const { message } = await req.json();

    const embedding = await GetEmbedding(message);

    // Tìm các message có embedding gần nhất
    const pastMessages = await prisma.message.findMany({
        where: {
            embedding: { not: [] },
            role: { not: 'assistant' },
        },
    });

    const topK = pastMessages
        .map((m) => ({
            ...m,
            similarity: cosineSimilarity(embedding, m.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

    const context = topK.map((m) => `${m.role}: ${m.content}`).join('\n');

    const prompt = `${context}\nuser: ${message}`;

    const response = await generateResponse(prompt);

    // Lưu cả câu hỏi và câu trả lời
    await saveMessageWithEmbedding('user', message);
    await saveMessageWithEmbedding('assistant', response);

    return Response.json({ response });
}
