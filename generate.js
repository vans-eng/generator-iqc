export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { time, batteryPercentage, carrierName, messageText, emojiStyle = 'apple' } = req.query;

  // Validasi parameter
  if (!time || !batteryPercentage || !carrierName || !messageText) {
    return res.status(400).json({ 
      error: 'Parameter tidak lengkap. Dibutuhkan: time, batteryPercentage, carrierName, messageText' 
    });
  }

  // Validasi batteryPercentage
  const battery = parseInt(batteryPercentage);
  if (isNaN(battery) || battery < 0 || battery > 100) {
    return res.status(400).json({ error: 'Battery percentage harus angka antara 0-100' });
  }

  // Validasi format time (HH:MM)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: 'Format waktu harus HH:MM (contoh: 14:30)' });
  }

  try {
    // URL API eksternal
    const apiUrl = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(carrierName)}&messageText=${encodeURIComponent(messageText)}&emojiStyle=${emojiStyle}`;

    // Fetch gambar dari API eksternal
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    // Dapatkan buffer gambar
    const imageBuffer = await response.arrayBuffer();

    // Set header response untuk gambar
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    
    // Kirim gambar
    res.status(200).send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('Error generating quote:', error);
    res.status(500).json({ 
      error: 'Gagal menghasilkan gambar', 
      details: error.message 
    });
  }
}