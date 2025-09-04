# MicroservicesDemo

## Spis treści
1. [Opis projektu](#opis-projektu)  
2. [Architektura systemu](#architektura-systemu)  
3. [Wymagania systemowe](#wymagania-systemowe)  
4. [Instrukcja instalacji i uruchomienia](#instrukcja-instalacji-i-uruchomienia)  
5. [Opis API endpoints](#opis-api-endpoints)  
6. [Przykłady użycia](#przyklady-uzycia)  
7. [Częste problemy i rozwiązania](#czeste-problemy-i-rozwiazania)  

---

## Opis projektu
`microservices-demo` to przykładowa aplikacja wykorzystująca architekturę mikroserwisów.  
Projekt składa się z dwóch głównych serwisów:  

- **Products Service** – zarządza produktami, pozwala tworzyć, aktualizować, usuwać i sprawdzać dostępność produktów.  
- **Orders Service** – umożliwia składanie zamówień i zarządzanie ich statusem.  

---

## Architektura systemu (ASCII)

          +------------------+
          | Products Service |
          |  (localhost:3000)|
          +--------+---------+
                   |
                   | REST API
                   v
          +------------------+
          | Orders Service   |
          |  (localhost:3002)|
          +--------+---------+
                   |
                   v
             +-----------+
             | Database  |
             +-----------+


- Komunikacja między serwisami odbywa się przez REST API.  
- Każdy serwis działa niezależnie i ma własną bazę danych (lokalną lub pamięć tymczasową).  

---

## Wymagania systemowe
- `Node.js >= 18  `
- `npm / yarn  `
- `Windows / Linux / MacOS`
- `Postman` lub inny klient `REST` do testów  

---

## Instrukcja instalacji i uruchomienia
### 1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/twoj-repo/microservices-demo.git
   cd microservices-demo
   ```

### 2. Zainstaluj zależności:

`npm install`

### 3. Uruchom serwisy:

- Products Service

`nx serve products-service`

- Orders Service

`nx serve orders-service`

### 4. Sprawdź, czy serwisy działają w przeglądarce lub Postmanie:

```yml
http://localhost:3000/api/products

http://localhost:3002/api/orders
```

## Opis API endpoints

### ProductsService

| Endpoint                                 | Metoda | Opis                         |
| ---------------------------------------- | ------ | ---------------------------- |
| `/api/products`                          | GET    | Pobiera wszystkie produkty   |
| `/api/products/:id`                      | GET    | Pobiera produkt po ID        |
| `/api/products`                          | POST   | Tworzy nowy produkt          |
| `/api/products/:id`                      | PUT    | Aktualizuje produkt po ID    |
| `/api/products/:id/availability/:amount` | GET    | Sprawdza dostępność produktu |
| `/api/products/:id/decrease`             | PATCH  | Zmniejsza ilość produktu     |

### Orders Service

| Endpoint                 | Metoda | Opis                          |
| ------------------------ | ------ | ----------------------------- |
| `/api/orders`            | GET    | Pobiera wszystkie zamówienia  |
| `/api/orders/:id`        | GET    | Pobiera szczegóły zamówienia  |
| `/api/orders`            | POST   | Tworzy nowe zamówienie        |
| `/api/orders/:id/status` | PATCH  | Aktualizuje status zamówienia |

## Przykłady użycia

### Dodanie produktu

```yml
POST http://localhost:3000/api/products
{
  "name": "Laptop",
  "price": 5500,
  "quantity": 3,
  "description": "High-end laptop"
}
```
### Składanie zamówienia

```yml
POST http://localhost:3002/api/orders
{
  "customerName": "Jan Kowalski",
  "items": [
    { "productId": 1, "quantity": 1 },
    { "productId": 2, "quantity": 2 }
  ]
}
```

## Troubleshooting

- Serwis nie odpowiada – upewnij się, że uruchomiłaś oba serwisy (`nx serve products-service` i `nx serve orders-service`).

- Błąd połączenia z portem – sprawdź, czy porty aplikacji nie są zajęte.

- Testy PowerShell nie działają – upewnij się, że plik jest zapisany w `UTF-8-BOM` i używasz prawidłowej ścieżki.

- Nieprawidłowe dane w zamówieniu – sprawdź ID produktów i dostępne ilości.