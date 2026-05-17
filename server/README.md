# ForgeBoard - Serverska Aplikacija

Ovo je backend deo ForgeBoard platforme.
API je razvijen koristeći Node.js, Express, TypeScript i bazu podataka MySQL.

## Arhitektura
Aplikacija je organizovana po višeslojnoj arhitekturi:
- **Kontroleri (Controllers):** Upravljanje HTTP zahtevima
- **Servisi (Services):** Poslovna logika i validacije
- **Repozitorijumi (Repositories):** Direktna komunikacija sa MySQL bazom podataka

## Pokretanje servera
Pre pokretanja, potrebno je podesiti pristupne podatke za bazu u okviru okruženja.
Nakon toga:

1. Instalacija zavisnosti: `npm install`
2. Pokretanje servera: `npm run dev`