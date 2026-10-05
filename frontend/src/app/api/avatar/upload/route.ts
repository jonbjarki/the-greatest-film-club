import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/../auth';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (
                pathname,
                /* clientPayload */
            ) => {
                // Authenticate users before generating the token
                const session = await auth();
                if (!session) throw new Error('Not authenticated');

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
                    maximumSizeInBytes: 5 * 1024 * 1024, // 5 MB
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Called by Vercel Blob when the client upload completes
                // Use tools like ngrok if you want this to work locally

                try {
                    // Run any logic after the file upload completed
                    // const { userId } = JSON.parse(tokenPayload);
                    // await db.update({ avatar: blob.url, userId });
                } catch (error) {
                    throw new Error('Could not update user');
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }, // The webhook will retry 5 times waiting for a 200
        );
    }
}