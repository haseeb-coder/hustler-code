## Run Locally

Clone the project

```bash
  git clone https://dredsoftlabs-admin@bitbucket.org/dredsoftlabs/ecommerce.git
```

Go to the project directory

```bash
  cd eCommerce
```

Install dependencies

```bash
  npm install

  or

  npm install react-material-ui-carousel --save --legacy-peer-deps
```

Start the server

```bash
  npm start
```

The server should now be running. You can access the application by opening a web browser and entering the following URL:

```bash
  http://localhost:3000
```


---

## Mock Product API (In-Memory)

A basic REST API is exposed under the `/mock` prefix using an in-memory dataset. This is separate from existing `/api/v1` routes to avoid conflicts.

Base URL (default dev):
- http://localhost:4001/mock

### Endpoints

1. GET `/products`
   - Description: Return a list of all products
   - Optional query: `?category=Apparel` filters by category (case-insensitive)

2. GET `/products/:id`
   - Description: Return a single product by numeric ID

3. POST `/products` (optional/bonus)
   - Description: Add a new product
   - Body (JSON):
     - name: string (required)
     - category: string (required)
     - price: number (required)
     - imageUrl: string (optional)
     - inStock: boolean (optional; default true)
     - variants: array (optional)
   - Validation: responds 400 with errors array on invalid input; 409 if ID conflict

### How to run

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the API server (runs backend + frontend concurrently via existing scripts)
   ```bash
   npm start
   # Backend listens on PORT=4001 by default
   ```
3. Test the API with curl or Postman (see examples below)

### Sample data

The in-memory dataset includes items like:
- Classic Tee (Apparel)
- Running Shoes (Footwear)
- Denim Jacket (Apparel)
- Wireless Headphones (Electronics)

### curl examples

- List all products
  ```bash
  curl -s http://localhost:4001/mock/products | jq .
  ```

- Filter by category
  ```bash
  curl -s "http://localhost:4001/mock/products?category=Apparel" | jq .
  ```

- Get by ID
  ```bash
  curl -s http://localhost:4001/mock/products/2 | jq .
  ```

- Create a product
  ```bash
  curl -s -X POST http://localhost:4001/mock/products \
    -H 'Content-Type: application/json' \
    -d '{
      "name": "Leather Belt",
      "category": "Apparel",
      "price": 25.0,
      "imageUrl": "https://via.placeholder.com/400x400?text=Leather+Belt",
      "inStock": true,
      "variants": ["S", "M", "L"]
    }' | jq .
  ```

### Swagger (OpenAPI) spec

OpenAPI 3.0 YAML is provided below. You can paste this into Swagger Editor (editor.swagger.io) or import into Postman.

```yaml
openapi: 3.0.3
info:
  title: Mock Product API
  version: 1.0.0
  description: Simple in-memory product API for demos
servers:
  - url: http://localhost:4001/mock
paths:
  /products:
    get:
      summary: List products
      parameters:
        - name: category
          in: query
          required: false
          schema:
            type: string
          description: Filter by category (case-insensitive)
      responses:
        '200':
          description: A JSON array of products
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'
    post:
      summary: Create product
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductCreate'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          description: Bad Request (validation)
        '409':
          description: Conflict (duplicate id)
  /products/{id}:
    get:
      summary: Get product by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: A product
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '404':
          description: Not Found
components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        category:
          type: string
        price:
          type: number
          format: float
        imageUrl:
          type: string
          nullable: true
        inStock:
          type: boolean
        variants:
          type: array
          items:
            oneOf:
              - type: string
              - type: number
    ProductCreate:
      type: object
      required: [name, category, price]
      properties:
        name:
          type: string
        category:
          type: string
        price:
          type: number
          format: float
        imageUrl:
          type: string
          nullable: true
        inStock:
          type: boolean
        variants:
          type: array
          items:
            oneOf:
              - type: string
              - type: number
```
