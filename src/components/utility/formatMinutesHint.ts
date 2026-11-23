function formatMinutesHint(rawValue: string): string {
  const num = Number(rawValue);
  if (!rawValue.trim() || Number.isNaN(num) || num <= 0) {
    return "Kosongkan jika tanpa batas. Contoh: 360 detik = 6 menit.";
  }

  const minutes = num / 60;
  const formattedMinutes = Number.isInteger(minutes)
    ? `${minutes}`
    : minutes.toFixed(1).replace(".", ",");

  const wholeMinutes = Math.floor(num / 60);
  const remainderSeconds = num % 60;

  if (wholeMinutes > 0 && remainderSeconds > 0) {
    return `Setara ${formattedMinutes} menit (${wholeMinutes} menit ${remainderSeconds} detik)`;
  }

  return `Setara ${formattedMinutes} menit`;
}

export default formatMinutesHint;
