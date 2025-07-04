# Elasticsearch Dashboard

A modern, responsive web dashboard for monitoring and managing Elasticsearch clusters. Built with React, TypeScript, and Tailwind CSS, featuring dark mode support and a beautiful Catppuccin theme.

## Features

- **Real-time Cluster Monitoring**: Monitor cluster health, nodes, and shard information
- **Index Management**: Browse, search, and examine Elasticsearch indexes
- **Advanced Search**: Search through documents with customizable queries
- **Document Viewer**: JSON viewer for examining document structures
- **Dark Mode**: Toggle between light and dark themes with Catppuccin theme support
- **Real-time Updates**: Automatic data refresh for live monitoring
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Screenshots

### Cluster Overview
Monitor your Elasticsearch cluster's health and performance metrics in real-time.

### Index Management
Browse all indexes with health status indicators, document counts, and size information.

### Document Search
Search through your data with an intuitive interface and JSON document viewer.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS with Catppuccin theme
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

- Node.js 18+ and npm
- An Elasticsearch cluster with REST API access

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/elasticsearch-dashboard.git
   cd elasticsearch-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_ELASTIC_NODE=https://your-elasticsearch-host:9200
   VITE_ELASTIC_USERNAME=your-username
   VITE_ELASTIC_PASSWORD=your-password
   
   # Optional: For development with self-signed certificates
   VITE_ELASTIC_REJECT_UNAUTHORIZED=false
   VITE_ELASTIC_USE_HTTP=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ELASTIC_NODE` | Elasticsearch cluster URL | Yes |
| `VITE_ELASTIC_USERNAME` | Basic auth username | Yes |
| `VITE_ELASTIC_PASSWORD` | Basic auth password | Yes |
| `VITE_ELASTIC_REJECT_UNAUTHORIZED` | Reject unauthorized SSL certificates | No |
| `VITE_ELASTIC_USE_HTTP` | Use HTTP instead of HTTPS (dev only) | No |

### SSL Certificate Handling

For development environments with self-signed certificates:

1. **Browser Certificate**: Visit your Elasticsearch URL directly and accept the certificate
2. **HTTP Mode**: Set `VITE_ELASTIC_USE_HTTP=true` to use HTTP
3. **Proxy Configuration**: The app includes a Vite proxy configuration for SSL issues

## Project Structure

```
elasticsearch-dashboard/
├── public/
│   └── vite.svg
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── DarkModeToggle.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── JsonViewer.tsx
│   │   ├── Layout.tsx
│   │   └── LoadingSpinner.tsx
│   ├── contexts/            # React contexts
│   │   └── ThemeContext.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useElasticsearch.ts
│   ├── pages/               # Page components
│   │   ├── IndexDetail.tsx
│   │   ├── Indexes.tsx
│   │   ├── Overview.tsx
│   │   └── Search.tsx
│   ├── services/            # API services
│   │   └── elasticsearch.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Key Components

### ElasticsearchService (`src/services/elasticsearch.ts`)
- Handles all API communication with Elasticsearch
- Includes SSL certificate handling for development
- Provides methods for cluster health, index management, and document search

### Custom Hooks (`src/hooks/useElasticsearch.ts`)
- React Query hooks for data fetching and caching
- Automatic refresh intervals for real-time updates
- Error handling and loading states

### Theme System (`src/contexts/ThemeContext.tsx`)
- Dark/light mode toggle
- Catppuccin theme integration
- Persistent theme preferences

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints Used

The dashboard interacts with the following Elasticsearch REST API endpoints:

- `GET /_cluster/health` - Cluster health information
- `GET /_cat/indices?format=json` - List all indexes
- `GET /{index}` - Get index mapping and settings
- `POST /{index}/_search` - Search documents
- `GET /{index}/_doc/{id}` - Get specific document
- `GET /_nodes/stats` - Node statistics
- `POST /{index}/_count` - Count documents

## Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **SSL Certificate Issues**: Helpful error messages and solutions
- **API Errors**: User-friendly error messages with retry options
- **Error Boundaries**: Catch and display React component errors

## Development

### Adding New Features

1. **API Methods**: Add new methods to `ElasticsearchService`
2. **Hooks**: Create corresponding React Query hooks in `useElasticsearch.ts`
3. **Components**: Build UI components following the existing patterns
4. **Routing**: Add new routes in `App.tsx`

### Styling Guidelines

- Use Tailwind CSS classes
- Follow the Catppuccin color scheme for dark mode
- Ensure responsive design with mobile-first approach
- Use consistent spacing and typography scales

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your web server

3. **Configure environment variables** in your deployment environment

4. **Set up HTTPS** for production environments

## Troubleshooting

### Common Issues

**Connection Refused**
- Verify Elasticsearch is running and accessible
- Check network connectivity and firewall settings

**SSL Certificate Errors**
- Accept certificate in browser by visiting Elasticsearch URL
- Use HTTP mode for development: `VITE_ELASTIC_USE_HTTP=true`

**Authentication Failed**
- Verify username and password in `.env` file
- Check Elasticsearch security settings

**CORS Issues**
- Configure Elasticsearch CORS settings
- Use the built-in proxy for development

### Browser Console Errors

Enable browser developer tools to see detailed error messages and network requests.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Elasticsearch documentation for API-related questions

## Acknowledgments

- [Elasticsearch](https://www.elastic.co/) for the powerful search engine
- [Catppuccin](https://github.com/catppuccin/catppuccin) for the beautiful color scheme
- [Lucide](https://lucide.dev/) for the icon set
- [TanStack Query](https://tanstack.com/query) for excellent data fetching