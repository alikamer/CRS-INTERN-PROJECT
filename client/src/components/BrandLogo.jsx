import { useState } from 'react';

const BrandLogo = ({ name, logoUrl, size = 32 }) => {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        className="rounded-full bg-[#0B57D0] text-white flex items-center justify-center font-bold shrink-0"
      >
        {name?.[0]?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size, padding: size * 0.14 }}
      className="rounded-full bg-white border border-[#E1E3E1] shrink-0 flex items-center justify-center"
    >
      <img
        src={logoUrl}
        alt={name}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export default BrandLogo;
