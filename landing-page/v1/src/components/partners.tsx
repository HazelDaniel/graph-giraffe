import LogoMarquee from "./logo-marquee"

export const Partners: React.FC = () => {
  return <>
  <div className="h-max w-full">
  <LogoMarquee direction="right" duration={50} gap={0} imageUrls={["/images/vendor/adobe.png", "/images/vendor/asus.png", "/images/vendor/ibm.png", "/images/vendor/meta.png", "/images/vendor/nvidia.png", "/images/vendor/openai.svg", "/images/vendor/spotify.png", "/images/vendor/tiktok.png", "/images/vendor/whatsapp.png"]} pauseOnHover/>
  <LogoMarquee direction="left" duration={50} gap={0} imageUrls={["/images/vendor/adobe.png", "/images/vendor/asus.png", "/images/vendor/ibm.png", "/images/vendor/meta.png", "/images/vendor/nvidia.png", "/images/vendor/openai.svg", "/images/vendor/spotify.png", "/images/vendor/tiktok.png", "/images/vendor/whatsapp.png"]} pauseOnHover/>
  </div>
  </>
}