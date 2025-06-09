exports.handler = async (event, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const { query } = event.queryStringParameters || {};
    
    if (!query) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: '검색어가 필요합니다.' })
        };
    }

    try {
        const response = await fetch(`https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}`, {
            headers: {
                'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
            }
        });

        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const item = data.items[0];
            const result = {
                lat: parseInt(item.mapy) / 10000000,
                lng: parseInt(item.mapx) / 10000000,
                level: 15,
                name: item.title.replace(/<[^>]*>/g, '')
            };
                        
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: '검색 결과가 없습니다.' })
            };
        }
    } catch (error) {
        console.error('API 오류:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'API 호출 실패' })
        };
    }
}; 