"use client";

export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  const clean = number.replace(/\D/g, "");
  const href = `https://wa.me/${clean}?text=${encodeURIComponent(
    "Hello, I'm interested in a property listed on your website."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform"
    >
      <WhatsAppIcon />
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-7 w-7 fill-current"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 0C7.164 0 0 7.163 0 16c0 2.825.738 5.47 2.028 7.773L0 32l8.467-2.002A15.94 15.94 0 0016 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.333a13.28 13.28 0 01-6.849-1.9l-.49-.292-5.027 1.187 1.237-4.907-.32-.504A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.289-9.84c-.399-.2-2.36-1.164-2.727-1.297-.367-.132-.634-.2-.9.2-.267.4-1.034 1.297-1.268 1.563-.233.267-.467.3-.866.1-.4-.2-1.688-.622-3.215-1.983-1.189-1.06-1.991-2.369-2.225-2.769-.234-.4-.025-.616.175-.815.181-.18.4-.467.6-.7.2-.233.267-.4.4-.666.133-.267.067-.5-.033-.7-.1-.2-.9-2.168-1.234-2.968-.324-.78-.654-.674-.9-.687-.234-.012-.5-.015-.767-.015-.267 0-.7.1-1.067.5-.366.4-1.4 1.366-1.4 3.333s1.433 3.867 1.633 4.133c.2.267 2.82 4.3 6.831 6.033.954.412 1.7.658 2.28.843.957.305 1.828.262 2.517.159.768-.114 2.36-.965 2.694-1.897.333-.933.333-1.732.233-1.9-.1-.167-.366-.267-.766-.466z" />
    </svg>
  );
}
