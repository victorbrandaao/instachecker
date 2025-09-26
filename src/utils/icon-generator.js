/**
 * Icon Generator for PWA
 * Gera ícones em diferentes tamanhos para PWA
 */
class IconGenerator {
  static generatePWAIcons() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Configuração base do ícone
    const baseIcon = {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      text: "IC",
      fontSize: 0.4, // 40% do tamanho do canvas
    };

    // Tamanhos necessários para PWA
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

    sizes.forEach((size) => {
      this.generateIcon(canvas, ctx, baseIcon, size);
    });
  }

  static generateIcon(canvas, ctx, config, size) {
    canvas.width = size;
    canvas.height = size;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");

    // Draw background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = size * 0.02;
    ctx.strokeRect(0, 0, size, size);

    // Draw text
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${size * config.fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add text shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = size * 0.02;
    ctx.shadowOffsetX = size * 0.01;
    ctx.shadowOffsetY = size * 0.01;

    ctx.fillText(config.text, size / 2, size / 2);

    // Convert to blob and create download link
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `instachecker-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }
}

// Auto-generate icons in development
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  console.log(
    "PWA: Icons can be generated via IconGenerator.generatePWAIcons()"
  );
  window.IconGenerator = IconGenerator;
}
