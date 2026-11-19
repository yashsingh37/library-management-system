# Library Management System

A lightweight, web-based application designed to automate book inventory, member registration, and borrowing workflows for libraries.

## Included features

### Admin

- Login and role-based access.
- Dashboard: total books, active issues, overdue issues and members.
- Add, edit and delete books.
- View registered users and create member/admin accounts.
- Issue books to members.
- Accept returns and calculate late fines.

### Member

- Register and login.
- View the complete book list.
- View own issue history, due dates, return dates and fines.

### Business rules

- Maximum 3 active books per member.
- A book cannot be issued when no copies are available.
- Due date is 7 days after issue date.
- A member cannot issue the same book twice while the first issue is active.
- Returning a book increases available copies.
- Late fine is Rs 5 per late day. This implementation uses elapsed 24-hour periods rounded up.
- A member with recorded returned-book fines exceeding Rs 100 cannot borrow another book.
- A book cannot be deleted while any copy is issued.

## Requirements

- Node.js
- MongoDB connection string
- npm
