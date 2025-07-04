# Nalar - CSIS Indonesia Frontend

A modern Next.js application for the Center for Strategic and International Studies (CSIS) Indonesia website.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Media Management** with Spotify integration
- **Admin Dashboard** for content management
- **Responsive Design** for all devices
- **Environment Configuration** for flexible deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui
- **Icons**: React Icons (Feather Icons)
- **State Management**: React Hooks
- **API Integration**: Native fetch with environment variables

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nalar.git
cd nalar
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_BACKEND_API_URL=http://your-backend-url
NEXT_PUBLIC_API_URL=http://fallback-api-url
```

## 🚀 Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Fetching Architecture

This project uses a flexible data fetching architecture that works with both local JSON files and remote API endpoints.

### Data Sources

The application can fetch data from three sources:

1. **Local JSON files** - Located in the `/data` directory, these files contain static data for development.
2. **API endpoints** - When `NEXT_PUBLIC_API_URL` is set in environment variables, the app will try to fetch from the API first.
3. **S3 bucket** - For static data hosting, files can be fetched from an S3 bucket at `https://s3-csis-web.s3.ap-southeast-1.amazonaws.com`.

### How Data Fetching Works

The data fetching logic is in `src/lib/api.ts` and follows this flow:

1. If `NEXT_PUBLIC_API_URL` is set, the app tries to fetch from the API first.
2. If API fetch fails or API URL is not set, it falls back to local JSON files.
3. For specific S3 data, the `fetchS3Data` function can be used.

### Setting Up for Development

For local development:

1. The `/data` directory contains JSON files for each data type.
2. Components connect with the API service in `src/lib/api.ts`.
3. No environment setup is needed as it defaults to local JSON.

### Preparing for Production

For production deployment:

1. Set `NEXT_PUBLIC_API_URL` to your API endpoint.
2. Or upload JSON files to S3 using the script:

```bash
node scripts/generate-s3-mock.js
```

This script will create a directory structure in `/s3-mock` that mirrors what should be uploaded to S3.

### Available Data Types

The following data types are available:

- Publications (`/data/publications-list.json`)
- Events (`/data/events.json`)
- Experts (`/data/experts.json`)
- Dashboards (`/data/dashboards.json`)
- Hot Topics (`/data/hot-topics.json`)
- Media (`/data/media.json`)
- News (`/data/news.json`)

### Component Integration

Components use the API service to fetch data based on their needs:

```javascript
import api from '@/lib/api';

// Inside a component
const [data, setData] = useState([]);

useEffect(() => {
  async function fetchData() {
    const response = await api.fetchPublications();
    if (!response.error) {
      setData(response.data);
    }
  }
  fetchData();
}, []);
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
