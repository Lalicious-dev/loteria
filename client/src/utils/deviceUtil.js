// src/utils/deviceUtils.js
export const isMobile = () => {
  return typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent;
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry/.test(ua)) {
    return 'mobile';
  } else if (/Tablet|iPad/.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
};