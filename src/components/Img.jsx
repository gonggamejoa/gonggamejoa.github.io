import { useState } from 'react';

// 이미지 로드 실패/없음 -> 디자인의 자리표시 문구를 그대로 보여준다.
export default function Img({ src, fallback, alt = '', style, className }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return fallback ?? null;
  return <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} className={className} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }} />;
}
