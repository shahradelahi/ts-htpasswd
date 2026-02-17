<h1 align="center">
  <sup>@se-oss/htpasswd</sup>
  <br>
  <a href="https://github.com/shahradelahi/ts-htpasswd/actions/workflows/ci.yml"><img src="https://github.com/shahradelahi/ts-htpasswd/actions/workflows/ci.yml/badge.svg?branch=main&event=push" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@se-oss/htpasswd"><img src="https://img.shields.io/npm/v/@se-oss/htpasswd.svg" alt="NPM Version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat" alt="MIT License"></a>
  <a href="https://bundlephobia.com/package/@se-oss/htpasswd"><img src="https://img.shields.io/bundlephobia/minzip/@se-oss/htpasswd" alt="npm bundle size"></a>
  <a href="https://packagephobia.com/result?p=@se-oss/htpasswd"><img src="https://packagephobia.com/badge?p=@se-oss/htpasswd" alt="Install Size"></a>
</h1>

_@se-oss/htpasswd_ is a high-performance, modern TypeScript library for managing HTTP Basic Authentication password files with zero runtime dependencies on system binaries.

---

- [Installation](#-installation)
- [Usage](#-usage)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#license)

## 📦 Installation

```bash
pnpm add @se-oss/htpasswd
```

<details>
<summary>Install using your favorite package manager</summary>

**npm**

```bash
npm install @se-oss/htpasswd
```

**yarn**

```bash
yarn add @se-oss/htpasswd
```

</details>

## 📖 Usage

### Core API

The core API is environment agnostic and works in Edge runtimes, Browsers, and Node.js.

```ts
import { parse, verify } from '@se-oss/htpasswd';

// Verify a password against a hash
const isValid = verify('password', '$apr1$salt$H6otmod9v9.WAn1o6Jtyf.');

// Parse htpasswd content
const entries = parse('user1:{SHA}W6ph5Mm5Pz8GgiULbPgzG37mj9g=');
```

### File System API

Node.js specific utilities for direct file manipulation with atomic writes.

```ts
import { addUser, authenticate } from '@se-oss/htpasswd/fs';

// Authenticate a user from a file
const isValid = await authenticate('.htpasswd', 'username', 'password');

// Add or update a user
await addUser('.htpasswd', 'username', 'password', 'bcrypt');
```

### CLI Usage

The package includes a CLI tool for managing `.htpasswd` files from the terminal.

```bash
# Create a new file with a bcrypt user
pnpm dlx @se-oss/htpasswd -c .htpasswd username password

# Add a user with MD5 (APR1) encryption
pnpm dlx @se-oss/htpasswd -m .htpasswd user2 pass2
```

### Supported Algorithms

- **Bcrypt:** Modern and secure (default).
- **APR1:** Apache's MD5-based algorithm.
- **SHA1:** Standard SHA1 hashing.
- **Plaintext:** Supported for legacy purposes (requires `unsafe` option in `parse`).

## 📚 Documentation

For all configuration options and detailed API references, please see [the API docs](https://www.jsdocs.io/package/@se-oss/htpasswd).

## 🤝 Contributing

Want to contribute? Awesome! To show your support is to star the project, or to raise issues on [GitHub](https://github.com/shahradelahi/ts-htpasswd).

Thanks again for your support, it is much appreciated! 🙏

## License

[MIT](/LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi) and [contributors](https://github.com/shahradelahi/ts-htpasswd/graphs/contributors).
