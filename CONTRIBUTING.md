# Contributing to Galileosky Parser Windows

Thank you for your interest in contributing to the Galileosky Parser Windows application! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Windows 10/11 (for testing)

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/WindowsGS.git
   cd WindowsGS
   ```
3. Install dependencies:
   ```bash
   npm run install-all
   ```
4. Set up development environment:
   ```bash
   npm run deploy-dev
   npm run setup-admin
   ```

## 📝 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run all tests
npm test

# Run parser tests
npm run test-parser

# Run authentication tests
npm run test-auth

# Build frontend
npm run build
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new GPS parsing feature"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

## 🏗️ Project Structure

```
WindowsGS/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── config/         # Configuration
│   └── tests/              # Backend tests
├── frontend/               # React web dashboard
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API services
│   └── tests/              # Frontend tests
├── mobile-frontend/        # Mobile interface
└── docs/                   # Documentation
```

## 📋 Coding Standards

### JavaScript/Node.js
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Handle errors appropriately

### React
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety (if applicable)
- Keep components small and focused

### Database
- Use Sequelize ORM
- Write migrations for schema changes
- Include proper indexes
- Handle database errors gracefully

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Parser Testing
```bash
npm run test-parser
```

### Integration Testing
```bash
npm run test-auth
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions and classes
- Include examples for complex APIs
- Document configuration options

### User Documentation
- Update README.md for new features
- Add screenshots for UI changes
- Include step-by-step guides

## 🐛 Bug Reports

When reporting bugs, please include:
1. **Environment**: OS version, Node.js version, npm version
2. **Steps to reproduce**: Clear, step-by-step instructions
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Logs**: Error messages and console output

## 💡 Feature Requests

When requesting features, please include:
1. **Problem description**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Use cases**: Who would benefit from this?
4. **Mockups**: UI/UX suggestions if applicable

## 🔄 Pull Request Process

1. **Fork and clone** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** following coding standards
4. **Test thoroughly** with different scenarios
5. **Update documentation** as needed
6. **Commit with clear messages** using conventional commits
7. **Push to your fork** and create a pull request
8. **Wait for review** and address feedback

### Pull Request Guidelines
- **Title**: Clear, descriptive title
- **Description**: Detailed description of changes
- **Tests**: Include test results
- **Screenshots**: For UI changes
- **Breaking changes**: Clearly marked if any

## 📋 Commit Message Format

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(parser): add support for multi-record packets
fix(auth): resolve 401 authentication errors
docs(readme): update installation instructions
```

## 🏷️ Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

## 📞 Getting Help

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Documentation**: Check README.md and docs/
- **Code**: Review existing code for examples

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to Galileosky Parser Windows! 🚀 