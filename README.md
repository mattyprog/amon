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

### Area barbiere (riservata)
- **Login** (`/admin/login`): protetto da password.
- **Dashboard** (`/admin`): agenda giorno per giorno con statistiche (numero
  appuntamenti, incasso previsto). Da qui il barbiere può:
  - vedere tutti gli appuntamenti con nome, telefono, servizio e note;
  - **annullare** una prenotazione (libera subito lo slot);
  - **bloccare** fasce orarie (pausa, ferie, impegni) così non risultano
    prenotabili.

L'accesso è protetto a due livelli: il file `proxy.ts` blocca ogni rotta
`/admin` senza sessione valida, e ogni azione sul database ri-verifica la
sessione (cookie firmato con HMAC-SHA256).

## Personalizzazione

Quasi tutto si configura da **`lib/shop.ts`**:
- dati del negozio (nome, indirizzo, telefono, email);
- **servizi** (nome, descrizione, durata, prezzo);
- **orari di apertura** per giorno della settimana;
- finestra di prenotazione e passo degli slot.

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
