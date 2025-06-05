import type { APIRoute } from 'astro';
import { RepologyService } from '../../services/repologyService';

export const POST: APIRoute = async () => {
  try {
    const repologyService = new RepologyService();
    await repologyService.clearCache();

    return new Response(JSON.stringify({
      success: true,
      message: 'Cache cleared successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to clear cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
