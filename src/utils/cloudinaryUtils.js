export function cloudinaryThumb(url, width, height) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
}
