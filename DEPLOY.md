# Pubblicare Amon online (gratis)

Tre tasselli, tutti con piano gratuito:

1. **GitHub** — ospita il codice
2. **Turso** — il database delle prenotazioni (SQLite ospitato)
3. **Vercel** — pubblica il sito e lo collega a GitHub

> Il sito e la PWA (app del barbiere) useranno lo **stesso** database Turso:
> quello che prenotano i clienti compare subito nell'app, e viceversa.

---

## 1) Carica il codice su GitHub

1. Crea un account su <https://github.com> (se non ce l'hai).
2. Crea un nuovo repository **vuoto** e privato, es. `amon`.
3. Dalla cartella del progetto:

```bash
git add .
git commit -m "Amon: sito prenotazioni + PWA"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/amon.git
git push -u origin main
```

> I file `.env.local` e `dev.db` **non** vengono caricati (sono già esclusi):
> le password restano private.

---

## 2) Crea il database su Turso

1. Registrati su <https://turso.tech> (login con GitHub).
2. Crea un nuovo **Database** (region: Europe, es. Amsterdam).
3. Annota due valori (servono dopo, su Vercel):
   - **Database URL** → `libsql://....turso.io` = `TURSO_DATABASE_URL`
   - **Auth Token** (crea un token) = `TURSO_AUTH_TOKEN`
4. **Crea le tabelle**: apri la console SQL del database su Turso e incolla, in
   ordine cronologico, il contenuto di OGNI file di migrazione che trovi in:

   ```
   prisma/migrations/<data>_init/migration.sql
   prisma/migrations/<data>_settings_users_services/migration.sql
   ```

   Creano le tabelle (appuntamenti, blocchi, utenti, servizi, orari,
   impostazioni). Fatto una sola volta.

> In alternativa, con la Turso CLI, lancia per ogni file in ordine:
> `turso db shell NOME-DB < prisma/migrations/.../migration.sql`

---

## 3) Pubblica su Vercel

1. Registrati su <https://vercel.com> (login con GitHub).
2. **Add New → Project** e importa il repository `amon`.
3. Vercel riconosce Next.js da solo. Prima di premere **Deploy**, apri
   **Environment Variables** e aggiungi:

   | Nome                 | Valore                                            |
   | -------------------- | ------------------------------------------------- |
   | `TURSO_DATABASE_URL` | l'URL `libsql://...` del passo 2                   |
   | `TURSO_AUTH_TOKEN`   | il token del passo 2                              |
   | `ADMIN_PASSWORD`     | la password con cui accederai a `/admin`          |
   | `AUTH_SECRET`        | un segreto casuale (vedi sotto)                   |

   Genera `AUTH_SECRET` sul tuo PC con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Premi **Deploy**. Dopo un minuto avrai un indirizzo tipo
   `https://amon.vercel.app`.

   - Sito clienti: `https://amon.vercel.app`
   - App barbiere: `https://amon.vercel.app/admin`

> Ad ogni `git push` su `main`, Vercel ripubblica automaticamente.

### Primo accesso all'app barbiere

Al primo login il sistema crea automaticamente l'utente titolare:

- **Nome utente:** `amon`
- **Password:** quella che hai messo in `ADMIN_PASSWORD`

Dopo l'accesso vai in **Impostazioni → Accessi** per cambiare la password e
creare gli account dei collaboratori (ognuno con il proprio nome utente).
In **Impostazioni** puoi anche gestire servizi, prezzi, orari e dati del
negozio: le modifiche si riflettono subito sul sito dei clienti.

---

## 4) Installa l'app sul telefono (PWA)

L'area barbiere è installabile come app, a schermo intero, con l'icona AMON.

**iPhone (Safari):**
1. Apri `https://amon.vercel.app/admin` e fai login.
2. Tocca **Condividi** → **Aggiungi a Home**.

**Android (Chrome):**
1. Apri lo stesso indirizzo e fai login.
2. Menu **⋮** → **Installa app** / **Aggiungi a schermata Home**.

Da quel momento hai l'icona AMON: si apre direttamente sul **calendario**
delle prenotazioni.

---

## Promemoria sicurezza

- Usa una **password robusta** per `ADMIN_PASSWORD` (è la chiave dell'agenda).
- Non condividere `AUTH_SECRET` né i token di Turso.
- Per cambiare la password in futuro: aggiorna `ADMIN_PASSWORD` su Vercel
  (Settings → Environment Variables) e fai un nuovo deploy.

## Aggiornare gli orari / servizi / dati del negozio

Tutto in `lib/shop.ts` (nome, indirizzo, telefono, servizi, orari). Modifica,
`git push`, e Vercel ripubblica da solo.
