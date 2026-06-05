# Amon Barbershop

Sito web del barbiere **Amon**: i clienti prenotano online in base alla
disponibilità reale, il barbiere gestisce e supervisiona gli appuntamenti da
un'area riservata.

Costruito con **Next.js 16** (App Router, Turbopack), **Tailwind CSS v4**,
**Prisma 7 + SQLite** e validazione con **Zod**.

## Avvio rapido

```bash
npm install
npx prisma migrate dev      # crea/aggiorna il database SQLite
npm run dev                 # http://localhost:3000
```

> Le variabili d'ambiente sono già pronte in `.env.local`. Prima di andare
> online **cambia `ADMIN_PASSWORD`** e rigenera `AUTH_SECRET`.

## Come funziona

### Lato cliente
- **Home** (`/`): presentazione, listino servizi, orari, dove siamo.
- **Prenotazione** (`/prenota`): il cliente sceglie servizio → giorno → orario
  → inserisce i dati. Gli orari mostrati sono **solo quelli realmente liberi**,
  calcolati da: orari di apertura − durata del servizio − prenotazioni già
  prese − blocchi del barbiere − orari già passati. La conferma è immediata.

### App barbiere (riservata, installabile come PWA)
È un'app gestionale separata, installabile sul telefono (icona "Amon Agenda"),
collegata allo stesso database del sito.

- **Login** (`/admin/login`): nome utente + password, **multi-utente**.
- **Agenda** (`/admin`): calendario mensile con badge degli appuntamenti per
  giorno; toccando un giorno si apre l'agenda con statistiche (numero
  appuntamenti, incasso previsto). Da qui il barbiere può:
  - vedere gli appuntamenti con nome, telefono, servizio e note;
  - **annullare** una prenotazione (libera subito lo slot);
  - **bloccare** fasce orarie (pausa, ferie, impegni).
- **Impostazioni** (`/admin/impostazioni`):
  - **Servizi e prezzi**, **Orari di apertura**, **Dati negozio** → si
    riflettono subito sul sito dei clienti;
  - **Accessi**: cambio password e gestione dei collaboratori (account
    separati; "titolare" può creare/revocare utenti).

L'accesso è protetto a due livelli: `proxy.ts` blocca ogni rotta `/admin`
senza sessione valida, e ogni azione sul database ri-verifica la sessione
(cookie firmato HMAC-SHA256). Le password sono salvate con hash scrypt.

Al primo avvio viene creato l'utente titolare `amon` con password =
`ADMIN_PASSWORD`, e i valori di default di servizi/orari/negozio.

## Personalizzazione

Tutto si gestisce **dall'app** in *Impostazioni* (servizi, orari, dati negozio,
accessi). I valori di default iniziali sono in **`lib/config.ts`**.

## Struttura

```
app/
  page.tsx              Home
  prenota/              Pagina e form di prenotazione (client)
  admin/                Login + dashboard barbiere
actions/                Server Action (booking, auth, admin)
lib/
  shop.ts               Configurazione negozio, servizi, orari
  availability.ts       Calcolo degli slot disponibili
  time.ts               Date/orari nel fuso del negozio
  auth.ts               Sessione firmata (Web Crypto)
  prisma.ts             Client del database
prisma/schema.prisma    Modelli Appointment e Block
proxy.ts                Protezione area /admin (ex middleware)
```

## Comandi utili

```bash
npm run dev        # sviluppo
npm run build      # build di produzione
npm run start      # avvia la build
npx prisma studio  # interfaccia visuale al database
```
