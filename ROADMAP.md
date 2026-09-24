# Roadmap — Cafea în Doi

## Obiectiv

Vizitatoarea trebuie să îl cunoască pe Adrian în ritmul ei, să găsească rapid informațiile importante și să poată iniția o conversație fără presiune inutilă.

## Etapa 1 — Încredere, accesibilitate și structură

- [x] Mesaj clar pe prima pagină: „Cunoaște-mă înainte să bem cafeaua”.
- [x] Traseu „Începe de aici” cu șase materiale esențiale.
- [x] Metadate distincte pentru paginile publice principale.
- [x] Etichete accesibile pentru formularul de invitație.
- [x] Blocarea `/admin` din robots.txt.
- [x] Eliminarea accesului Admin din subsolurile paginilor publice principale.
- [ ] Eliminarea accesului Admin din subsolurile articolelor vechi.
- [x] Banner cookies mai compact pe mobil și desktop.
- [ ] Uniformizarea meniului desktop pe toate paginile.
- [x] Limitare persistentă în Supabase pentru autentificare și formularul de invitație.
- [x] Sesiuni Admin semnate, aleatoare și cu expirare verificată pe server.
- [x] Verificarea conținutului real al fișierelor încărcate.

## Etapa 2 — Conversie și cunoaștere graduală

- [x] Formular de invitație în două etape.
- [x] Fotografie opțională la primul mesaj.
- [x] Verificare live obligatorie, fără galerie: selfie sau video mut de maximum 5 secunde.
- [x] Test rapid de compatibilitate: 20 de întrebări.
- [ ] Păstrarea testului complet de 100 de întrebări ca opțiune avansată.
- [ ] Salvarea locală a progresului testului.
- [ ] Explicație clară despre durata fiecărui test.

## Etapa 3 — SEO, distribuire și performanță

- [ ] Imagine socială dedicată, format 1200 × 630 px.
- [x] Date structurate Person și BreadcrumbList.
- [ ] Date structurate Article pentru fiecare articol.
- [ ] Data publicării și actualizării pentru articole.
- [ ] Conversia imaginilor mari în WebP/AVIF.
- [ ] Încărcare progresivă pentru galeria foto.
- [ ] Evenimente de măsurare pentru traseul: început → articol → test → invitație.

## Etapa 4 — Conținut și administrare

- [ ] Program editorial gradual pentru articole și declarații.
- [ ] Recomandări de articole bazate pe temele citite.
- [ ] Statistici de conversie în Admin.
- [ ] Politică automată de retenție și ștergere a invitațiilor și fotografiilor.

## Etapa 5 — Consolidare după auditul tehnic

### Critic

- [x] Alinierea uploadului live la limita Vercel: maximum 4 MB, selfie comprimat și bitrate video controlat.
- [x] Rate limiting persistent și fail-closed pentru autentificarea Admin și invitații.
- [x] Înlocuirea cookie-ului Admin determinist cu sesiune HMAC aleatoare și expirabilă.
- [ ] Upload direct în Supabase Storage prin URL semnat, cu verificare server-side și curățarea fișierelor abandonate.

### Important

- [x] Persistența profilului de compatibilitate în `app_settings`.
- [x] Migrarea convenției Next.js 16 de la `middleware.ts` la `proxy.ts`.
- [ ] Canale Supabase Realtime private, autorizate per conversație.
- [ ] Ștergere fizică garantată cât mai aproape de pragul de 24 de ore.
- [ ] Validare/allowlist și servire sigură pentru imaginile externe ale declarațiilor.
- [ ] Sanitizarea conținutului HTML primit prin webhook-ul Resend.
- [ ] CSP fără `unsafe-inline`, cu nonce-uri generate per răspuns.

### Calitate și operare

- [x] Versiuni exacte pentru dependențele directe și lockfile păstrat.
- [ ] Teste automate pentru autentificare, invitații, portal, conversații și retenție.
- [ ] ESLint și verificări CI obligatorii înainte de deploy.
- [ ] Înlocuirea elementelor `<img>` rămase cu `next/image` unde este potrivit.
- [ ] Activarea și verificarea observabilității Vercel pentru erorile runtime.

## Indicatori urmăriți

- accesări ale traseului „Începe de aici”;
- articole citite înainte de invitație;
- rata de începere și finalizare a testului;
- rata de începere și trimitere a invitației;
- abandonul la fotografia/video live și alegerea orei;
- distribuiri și reveniri pe site.
