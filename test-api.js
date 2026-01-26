// 测试字体子集化 API
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/fonts/subset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fontNames: ['11zon_douyuFont-2.ttf'],
        text: '测试文字Test',
        outputFormats: ['ttf', 'woff', 'woff2'],
        downloadAll: false,
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Response (first 500 chars):', text.substring(0, 500));
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testAPI();
