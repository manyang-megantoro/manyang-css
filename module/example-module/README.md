# Example Module Skeleton

Ini adalah contoh module untuk manyang-css. Gunakan struktur ini untuk membuat module baru.

## Struktur Folder

```
module/
  example-module/
    scss/
      manyang-example-module.scss
    effect-map.json
    README.md
```

- **scss/manyang-example-module.scss**: SCSS utama untuk efek di module ini. Nama file harus diawali `manyang-` dan sesuai nama module.
- **effect-map.json**: Mapping trigger, effect, dan model untuk demo.
- **README.md**: Penjelasan singkat module.

## Cara Menambah Module Baru
1. Copy folder `example-module` dan ganti namanya.
2. Edit SCSS dan effect-map.json sesuai kebutuhan.
3. Jalankan build agar CSS dan mapping module otomatis masuk ke demo.

## Contoh effect-map.json
```json
{
  "relation": {
    "hover": {
      "prefix": "example",
      "list": {
        "flip": ["example-box"],
        "fade": ["example-box"]
      }
    }
  },
  "model": {
    "example-box": "<div class=\"manyang-example-box {effectClass}\">Example Box</div>"
  }
}
```
