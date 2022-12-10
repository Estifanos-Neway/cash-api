# Cash Machine Mart API

A robust Node.js/Express.js backend API for the Cash Machine Mart platform, providing comprehensive e-commerce and affiliate management functionality.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Admin Management**: Complete admin panel with settings and user management
- **Product Management**: Full CRUD operations for products and categories
- **Affiliate System**: Multi-level affiliate management with commission tracking
- **Order Management**: Complete order lifecycle management
- **Transaction Tracking**: Financial transaction monitoring and reporting
- **Analytics**: Comprehensive analytics and reporting system
- **Contact Management**: Customer support and contact form handling
- **Static Content Management**: Dynamic web content management
- **File & Image Management**: Secure file upload and image handling

### Technical Features
- **RESTful API**: Well-structured REST endpoints
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Rate Limiting**: Built-in request rate limiting for security
- **CORS Support**: Configurable cross-origin resource sharing
- **Security**: Helmet.js security headers and input validation
- **Email Integration**: Nodemailer integration for notifications
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Comprehensive Jest test suite
- **Logging**: Morgan HTTP request logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- SMTP server for email functionality

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Estifanos-Neway/cash-api.git
   cd cash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # JWT Configuration
   JWT_SECRETE=your_jwt_secret_key
   JWT_REFRESH_SECRETE=your_jwt_refresh_secret_key
   
   # API Security
   API_KEY=your_api_key
   
   # Database Configuration
   DB_URL=mongodb://localhost:27017/cash_machine_mart
   DB_URL_TEST=mongodb://localhost:27017/cash_machine_mart_test
   
   # Server Configuration
   PORT=3000
   
   # Email Configuration
   EMAIL_FROM=your_email@domain.com
   SMTP_URL=smtp://username:password@smtp.domain.com:587
   
   # Additional Security
   PRIVATE_KEY=your_private_key
   ```

4. **Database Initialization**
   ```bash
   npm run init
   ```

## 🚀 Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test-admin.router
npm run test-sessions.router
npm run test-products.router
npm run test-affiliates.router
npm run test-orders.router
npm run test-analytics.router
npm run test-contact-us.router
npm run test-static-web-contents.router
npm run test-product-categories.router
npm run test-miscellaneous
```

## 📚 API Documentation

### Interactive Documentation
Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/docs`
- **API Responses**: `http://localhost:3000/docs/responses`

### Available Endpoints

#### Authentication & Sessions
- `POST /sessions/sign-up` - User registration
- `POST /sessions/sign-in` - User login
- `POST /sessions/refresh` - Refresh access token
- `POST /sessions/sign-out` - User logout

#### Admin Management
- `POST /admin/sign-in` - Admin login
- `GET /admin` - Get admin data
- `PATCH /admin/username` - Update admin username
- `PATCH /admin/password-hash` - Update admin password
- `GET /admin/settings` - Get admin settings
- `PATCH /admin/settings` - Update admin settings

#### Product Management
- `GET /products` - Get all products
- `POST /products` - Create new product
- `GET /products/:id` - Get specific product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### Product Categories
- `GET /product-categories` - Get all categories
- `POST /product-categories` - Create new category
- `GET /product-categories/:id` - Get specific category
- `PATCH /product-categories/:id` - Update category
- `DELETE /product-categories/:id` - Delete category

#### Affiliate Management
- `GET /affiliates` - Get all affiliates
- `POST /affiliates/sign-up` - Affiliate registration
- `POST /affiliates/sign-in` - Affiliate login
- `GET /affiliates/:id` - Get specific affiliate
- `PATCH /affiliates/:id` - Update affiliate
- `DELETE /affiliates/:id` - Delete affiliate
- `GET /affiliates/:id/transactions` - Get affiliate transactions

#### Order Management
- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get specific order
- `PATCH /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

#### Transaction Management
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create new transaction
- `GET /transactions/:id` - Get specific transaction
- `PATCH /transactions/:id` - Update transaction

#### Analytics
- `GET /analytics` - Get analytics data
- `POST /analytics` - Create analytics entry

#### Contact Management
- `GET /contact-us` - Get contact submissions
- `POST /contact-us` - Submit contact form

#### Static Web Content
- `GET /static-web-contents` - Get static content
- `POST /static-web-contents` - Create static content
- `GET /static-web-contents/:id` - Get specific content
- `PATCH /static-web-contents/:id` - Update static content
- `DELETE /static-web-contents/:id` - Delete static content

#### File & Image Management
- `GET /images/:filename` - Get image file
- `POST /images` - Upload image

## 🔧 Configuration

### CORS Configuration
CORS whitelist is configured in `src/configs.js`. Update the `corsWhiteList` array to include your frontend domains.

### Rate Limiting
Rate limiting is configured to allow a maximum number of requests per minute. This can be adjusted in `src/commons/variables.js`.

### Security Features
- **Helmet.js**: Security headers
- **Rate Limiting**: Request throttling
- **Input Validation**: Request data validation
- **JWT Authentication**: Secure token-based authentication
- **API Key Authentication**: Additional security layer

## 📁 Project Structure

```
src/
├── api-docs/          # API documentation and responses
├── assets/            # Static assets (emails, files, images)
├── commons/           # Common utilities and constants
├── configs.js         # Application configuration
├── controllers/       # Request handlers and middleware
├── database/          # Database models and connections
├── entities/          # Data entities and schemas
├── public/            # Public static files
├── repositories/      # Data access layer
├── routers/           # API route definitions
├── app.js            # Express application setup
├── env.js            # Environment configuration
├── index.js          # Application entry point
└── init.js           # Database initialization
```

## 🧪 Testing

The project includes comprehensive test coverage using Jest and Supertest:

- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB memory server for testing

Run tests with:
```bash
npm test
```

## 📝 Changelog

See the [changelogs](./changelogs/) directory for detailed version history and feature updates.

### Recent Updates (v0.6.1)
- Restricted product deletion to products with no pending orders
- Enhanced security measures
- Improved error handling

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the changelog for recent updates

## 🔗 Links

- **Repository**: https://github.com/Estifanos-Neway/cash-api
- **Issues**: https://github.com/Estifanos-Neway/cash-api/issues
- **API Documentation**: Available at `/docs` when server is running