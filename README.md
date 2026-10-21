# Store & PokeAPI

A two-page web project built with **Vanilla JavaScript** on the front-end and **Spring Boot + PostgreSQL** on the back-end.

- **Page 1 – Products (Store):** product catalog connected to a custom REST API.
- **Page 2 – Pokédex (PokeAPI):** Pokémon explorer that consumes the public [PokéAPI](https://pokeapi.co/).

---

## 1. Scope

### Page 1 – Products (`index.html`)
- **Instant search:** the list is filtered on every keystroke (no delay) by name, description or category.
- **Card layout:** each product is shown as a card with image, category, name, description and price.
- **3 equal-size columns:** cards keep the same height even when descriptions have very different lengths (CSS Grid + Flexbox).
- **Responsive design:** 3 columns on desktop, 2 on tablets and 1 on phones (media queries).
- **Full CRUD with the back-end:** create, read, update and delete products through `/api/products` (Spring Boot + JPA + PostgreSQL).
- **Detail view on the same page:** clicking a card opens a modal with the full product information.
- **Initial data:** the back-end seeds 6 sample products the first time it starts.

### Page 2 – Pokédex (`pokemon.html`)
- **Chained consumption of 3 endpoints:** each request uses the data returned by the previous one:
  1. `GET /api/v2/pokemon/{idOrName}` → returns `species.url`
  2. `GET {species.url}` (`/api/v2/pokemon-species/{id}`) → returns the description and `evolution_chain.url`
  3. `GET {evolution_chain.url}` (`/api/v2/evolution-chain/{id}`) → returns the evolution chain
- **Cards with image and description**, in the same responsive 3-column grid.
- **Detail view on the same page:** clicking a card opens a modal (no new tab, no URL change) with artwork (normal/shiny), stats, abilities and evolution chain.
- **Debounced search (4 seconds):** the search runs only **4 seconds after the user stops typing**. A progress bar shows the countdown.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Front-end | HTML5, CSS3 (Grid, Flexbox, Media Queries), Vanilla JavaScript (ES Modules) |
| Back-end | Java 21, Spring Boot 4 (Web MVC, Data JPA) |
| Database | PostgreSQL |
| Build tool | Maven (Maven Wrapper included) |
| External API | [PokéAPI v2](https://pokeapi.co/docs/v2) |

---

## 3. Project Structure

```text
Tienda_PokeAPI/
├── pom.xml
├── README.md
├── LICENSE
└── src/
    ├── main/
    │   ├── java/com/crud/store/
    │   │   ├── StoreApplication.java          # Spring Boot entry point
    │   │   ├── model/Product.java             # JPA entity (table "products")
    │   │   ├── repository/ProductRepository.java
    │   │   ├── service/ProductService.java    # CRUD logic + initial data seed
    │   │   └── controller/ProductController.java  # REST API /api/products
    │   └── resources/
    │       ├── application.properties         # Database configuration
    │       └── static/                        # Front-end served by Spring Boot
    │           ├── index.html                 # Page 1 - Products
    │           ├── pokemon.html               # Page 2 - Pokédex
    │           ├── css/styles.css
    │           └── src/                       # Modular JavaScript (ES Modules)
    │               ├── shared/
    │               │   ├── utils.js           # Price format, HTML escape, modal helpers
    │               │   └── debounce.js        # Generic debounce with progress callback
    │               ├── products/
    │               │   ├── main.js            # Page entry point + instant search
    │               │   ├── productApi.js      # REST client for /api/products
    │               │   ├── productView.js     # Card rendering + detail modal
    │               │   ├── productForm.js     # Create / edit form modal
    │               │   └── sampleProducts.js  # Fallback data when the back-end is offline
    │               └── pokemon/
    │                   ├── main.js            # Page entry point + 4s debounced search
    │                   ├── pokeApi.js         # 3 chained PokéAPI requests
    │                   ├── pokemonView.js     # Card rendering + search status
    │                   └── pokemonDetail.js   # Detail modal on the same page
    └── test/java/com/crud/store/StoreApplicationTests.java
```

---

## 4. REST API (Products)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create a product (JSON body) |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

Example body:

```json
{
  "name": "Ultralight Gaming Mouse",
  "price": 54.9,
  "category": "Peripherals",
  "image": "https://example.com/mouse.jpg",
  "description": "26,000 DPI optical sensor and a 58g chassis."
}
```

---

## 5. Getting Started (step by step)

### Prerequisites
- **Java 21** (JDK)
- **PostgreSQL** 14 or later
- **Git**
- Maven is **not** required (the project includes the Maven Wrapper `mvnw`).

### Step 1 – Clone the repository
```bash
git clone https://github.com/sebastian123magno1-eng/tienda_pokeApi.git
cd tienda_pokeApi
```

### Step 2 – Create the database
Open `psql` or pgAdmin and run:
```sql
CREATE DATABASE bd_tienda;
```

### Step 3 – Configure the connection
Edit `src/main/resources/application.properties` with your PostgreSQL credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bd_tienda
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```
The `products` table is created automatically (`spring.jpa.hibernate.ddl-auto=update`), and 6 sample products are inserted on the first run.

### Step 4 – Run the application
Windows:
```powershell
.\mvnw.cmd spring-boot:run
```
macOS / Linux:
```bash
./mvnw spring-boot:run
```
Alternatively, open the project in IntelliJ IDEA and run `StoreApplication`.

### Step 5 – Open the pages
- Products: <http://localhost:8080/index.html>
- Pokédex: <http://localhost:8080/pokemon.html>

> **Note:** the JavaScript uses ES Modules, so the pages must be served over HTTP (by Spring Boot or a tool like VS Code *Live Server*). Opening the HTML file directly with `file://` will not load the modules.
> If the back-end is not running, the Products page falls back to in-memory sample data so it can still be demonstrated.

---

## 6. Licenses

### Project license
This project is distributed under the **MIT License**. See the [`LICENSE`](LICENSE) file.

### Third-party software
| Software | License |
|----------|---------|
| Spring Boot / Spring Framework | Apache License 2.0 |
| Hibernate ORM | Apache License 2.0 |
| PostgreSQL JDBC Driver | BSD-2-Clause |
| PostgreSQL | PostgreSQL License |
| Project Lombok | MIT License |
| Maven Wrapper | Apache License 2.0 |
| PokéAPI (data and sprites) | BSD-3-Clause (code). Pokémon and Pokémon names are trademarks of Nintendo, Game Freak and The Pokémon Company; data is used for educational purposes only |
| Unsplash images (sample products) | Unsplash License |
