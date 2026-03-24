# SwapMeetReact

SwapMeetReact is a full-stack marketplace system built to demonstrate clear user flow, structured UI architecture, and real data relationships across categories, products, and users.

Rather than relying on surface-level styling alone, the app emphasizes consistency and maintainability through a defined design system and reusable components such as shared cards, headers, form shells, and loading and empty states. The frontend was intentionally refactored to reduce duplication and keep pages focused on data flow, while the backend supports scoped data access and predictable API behavior.

The result is a clean, understandable application that demonstrates how a marketplace works under the hood, not just how it looks on the surface.

---

## Live Demo

https://swapmeetreact-ad48473e0ba5.herokuapp.com/

---

## Tech Stack

**Frontend**
- React
- React Router
- Axios
- Bootstrap (selectively used)

**Backend**
- Node.js
- Express

**Database**
- MySQL (JawsDB on Heroku)
- Sequelize ORM

**Deployment**
- Heroku (monolith architecture — frontend + backend served together)

---

## Core Features

- Category-based product browsing across all sellers
- Product detail view with seller context
- User-specific cart spanning multiple shops
- Shop/profile page displaying seller-specific inventory
- Owner dashboard for managing products and categories (CRUD)
- Centralized API structure with predictable responses
- Shared UI components for consistency across pages

---

## Architecture Notes

- Deployed as a **single Heroku monolith** (Express serves React build)
- API and frontend operate from the same origin (no separate client deploy)
- Backend routes organized for consistent data access patterns
- Frontend structured around reusable components instead of duplicated markup
- Environment-based configuration for local vs production behavior

---

## User Flow Overview

1. Browse categories or recent products from the homepage  
2. View products within a category  
3. Inspect product details and seller information  
4. Add items to a cart (across multiple sellers)  
5. Manage cart and simulate checkout  
6. Sellers manage their own inventory via dashboard  

---

## Local Setup

```bash
git clone https://github.com/espinbrandon49/Swap-Meet-React.git
cd swapmeetreact
npm install
```

### Environment Variables

Create a `.env` file in the server:

```
DB_NAME=your_db
DB_USER=your_user
DB_PW=your_password
DB_HOST=localhost
DB_PORT=3306
```

### Run locally

```bash
npm start
```

---

## Seeding the Database

To populate initial data:

```bash
node seeds/index.js
```

---

## Notes

- This project was intentionally refactored beyond its original bootcamp scope to improve structure, consistency, and deployment strategy.
- Focus was placed on **clarity of data flow**, not just UI appearance.
- Designed as a **portfolio-ready demonstration of full-stack fundamentals**.

---

## Demo Video

https://youtu.be/gm3SuokmNJE
