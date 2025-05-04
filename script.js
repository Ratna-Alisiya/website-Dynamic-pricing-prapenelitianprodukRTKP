const scanData = [];

function interpretColor(rgb) {
  const isClose = (a, b, tolerance = 10) => Math.abs(a - b) <= tolerance;
  if (isClose(rgb.r, 180) && isClose(rgb.g, 150) && isClose(rgb.b, 80)) {
    return "Sangat Layak Dikonsumsi";
  } else if (isClose(rgb.r, 100) && isClose(rgb.g, 120) && isClose(rgb.b, 60)) {
    return "Masih Layak Dikonsumsi";
  } else if (isClose(rgb.r, 80) && isClose(rgb.g, 80) && isClose(rgb.b, 100)) {
    return "Kurang Layak Dikonsumsi";
  } else {
    return "Tidak Dikenali";
  }
}

function getPriceByQuality(quality) {
  switch (quality) {
    case "Sangat Layak Dikonsumsi": return "Rp 25.000";
    case "Masih Layak Dikonsumsi": return "Rp 10.000";
    case "Kurang Layak Dikonsumsi": return "Rp 7.000";
    default: return "Harga tidak tersedia";
  }
}

function updateDisplay(rgb) {
  const quality = interpretColor(rgb);
  const price = getPriceByQuality(quality);
  document.getElementById("quality").innerText = "Kualitas: " + quality;
  document.getElementById("price").innerText = "Harga: " + price;

  const now = new Date().toLocaleString();
  scanData.push({ time: now, ...rgb, quality, price });
  updateHistoryTable();
}

function updateHistoryTable() {
  const tbody = document.querySelector("#scanHistory tbody");
  tbody.innerHTML = "";
  scanData.forEach(entry => {
    const row = `<tr>
      <td>${entry.time}</td>
      <td>${entry.r}</td>
      <td>${entry.g}</td>
      <td>${entry.b}</td>
      <td>${entry.quality}</td>
      <td>${entry.price}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function exportToCSV() {
  if (scanData.length === 0) {
    alert("Belum ada data untuk diekspor.");
    return;
  }
  const headers = ["Waktu", "R", "G", "B", "Kualitas", "Harga"];
  const rows = scanData.map(d => [d.time, d.r, d.g, d.b, d.quality, d.price]);
  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n"
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "riwayat_scan_rendang.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function extractRGBFromQR(text) {
  try {
    const rgb = JSON.parse(text);
    if (rgb.r !== undefined && rgb.g !== undefined && rgb.b !== undefined) {
      updateDisplay(rgb);
    }
  } catch (e) {
    document.getElementById("quality").innerText = "Format QR tidak sesuai.";
  }
}

const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        html5QrCode.stop();
        extractRGBFromQR(decodedText);
        setTimeout(() => {
          html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, extractRGBFromQR);
        }, 2000);
      }
    );
  }
}).catch(err => {
  document.getElementById("quality").innerText = "Error: " + err;
});

function generateQR() {
  const r = parseInt(document.getElementById("r").value);
  const g = parseInt(document.getElementById("g").value);
  const b = parseInt(document.getElementById("b").value);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    alert("Harap masukkan nilai RGB yang valid (0-255)");
    return;
  }

  new QRious({
    element: document.getElementById("qrCanvas"),
    size: 200,
    value: JSON.stringify({ r, g, b })
  });
}
