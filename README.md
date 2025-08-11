# QuickLang - Language Learning Flashcard App

A modern language learning application built with Next.js, featuring interactive flashcards, authentication, and PostgreSQL database integration.

## Features

- 📚 **Interactive Flashcards**: Create, edit, and study language flashcards with flip animations
- 🔐 **Authentication**: Secure login with NextAuth.js (Facebook OAuth ready)
- 💾 **PostgreSQL Database**: Persistent data storage with Docker containerization
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 📊 **Study Tracking**: Track review counts and difficulty levels for each card

## Tech Stack

- **Frontend**: Next.js 15.4.6, React 19, TypeScript
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with pg driver
- **Containerization**: Docker & Docker Compose
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ 
- Docker Desktop (for PostgreSQL)
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/quicklang.git
cd quicklang
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Facebook OAuth (optional)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=quicklang
DB_USER=postgres
DB_PASSWORD=quicklang123
```

### 4. Start the PostgreSQL database

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker-compose ps
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
quicklang/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   └── flashcards/    # Flashcard CRUD operations
│   ├── flashcards/        # Flashcard pages
│   │   ├── [id]/edit/     # Edit flashcard
│   │   ├── new/           # Create flashcard
│   │   └── study/         # Study mode
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── FlashCard.tsx      # Flashcard display component
│   ├── FlashCardForm.tsx  # Create/Edit form
│   └── Providers.tsx      # Context providers
├── lib/                   # Utility functions
│   ├── db.ts              # Database connection
│   ├── flashcards-db.ts   # Database operations
│   └── types.ts           # TypeScript types
├── db/                    # Database files
│   └── init.sql           # Initial schema & data
└── docker-compose.yml     # Docker configuration
```

## Database Management

### Connect to PostgreSQL

```bash
# Access PostgreSQL CLI
docker exec -it quicklang-postgres psql -U postgres -d quicklang

# View tables
\dt

# Query flashcards
SELECT * FROM flashcards;
```

### Database Commands

```bash
# Stop database
docker-compose down

# Stop and remove all data
docker-compose down -v

# View logs
docker-compose logs postgres
```

## API Endpoints

### Flashcards

- `GET /api/flashcards` - Get all flashcards
- `POST /api/flashcards` - Create new flashcard
- `GET /api/flashcards/[id]` - Get specific flashcard
- `PUT /api/flashcards/[id]` - Update flashcard
- `DELETE /api/flashcards/[id]` - Delete flashcard
- `POST /api/flashcards/[id]/review` - Increment review count

## Features in Detail

### Flashcard Management
- Create flashcards with word, meaning, example, and image
- Edit existing flashcards
- Delete flashcards
- Filter by difficulty (easy, medium, hard)
- Category organization

### Study Mode
- Interactive flip cards
- Track review progress
- Visual difficulty indicators
- Image support for visual learning

### Database Schema

```sql
CREATE TABLE flashcards (
  id VARCHAR(50) PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  image_url TEXT,
  meaning TEXT NOT NULL,
  example TEXT NOT NULL,
  category VARCHAR(100),
  difficulty VARCHAR(20),
  created_at TIMESTAMP,
  last_reviewed TIMESTAMP,
  review_count INTEGER DEFAULT 0
);
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

1. Create new API routes in `app/api/`
2. Add React components in `components/`
3. Update database schema in `db/init.sql`
4. Modify database operations in `lib/flashcards-db.ts`

## Troubleshooting

### Port Conflicts
If port 5433 is already in use, update the port in:
- `docker-compose.yml`
- `.env.local`

### Database Connection Issues
1. Ensure Docker is running
2. Check container status: `docker-compose ps`
3. View logs: `docker-compose logs postgres`
4. Verify environment variables in `.env.local`

### NextAuth Issues
1. Ensure `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your development URL
3. For production, update OAuth redirect URLs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Database powered by [PostgreSQL](https://www.postgresql.org/)
- Containerization with [Docker](https://www.docker.com/)