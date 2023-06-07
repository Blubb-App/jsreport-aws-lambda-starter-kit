function nowLocalStr () {
  return new Date().toLocaleString(undefined, {
    hour12: false,
  })
}
