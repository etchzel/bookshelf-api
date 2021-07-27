const {nanoid} = require('nanoid');
const bookshelf = require('./bookshelf');

const insertBookHandler = (req, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = req.payload;

  const id = nanoid(16);
  const finished = readPage === pageCount;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const failMessage = 'Gagal menambahkan buku. ';

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: failMessage + 'Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: failMessage + 'readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const book = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  bookshelf.push(book);

  const isSuccess = bookshelf.filter((b) => {
    return b.id === id;
  }).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (req) => {
  const queryParam = req.query;
  const queryKey = Object.keys(queryParam)[0];

  const filterCallback = (b) => {
    if (queryKey !== undefined) {
      if (queryKey === 'name') {
        return b.name.match(new RegExp(queryParam.name, 'i'));
      }
      const bool = b[queryKey] ? '1' : '0';
      return bool === queryParam[queryKey];
    }
    return true;
  };

  const books = bookshelf.filter((b) => filterCallback(b))
      .map((b) => {
        const display = (({id, name, publisher}) => ({id, name, publisher}))(b);
        return display;
      });

  const response = {
    status: 'success',
    data: {
      books: books,
    },
  };

  return response;
};

const getBookByIdHandler = (req, h) => {
  const {id} = req.params;
  const book = bookshelf.filter((b) => {
    return b.id === id;
  })[0];

  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book: book,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (req, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = req.payload;
  const {id} = req.params;

  const finished = readPage === pageCount;
  const updatedAt = new Date().toISOString();
  const failMessage = 'Gagal memperbarui buku. ';

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: failMessage + 'Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: failMessage + 'readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = bookshelf.findIndex((b) => {
    return b.id === id;
  });

  if (index > -1) {
    bookshelf[index] = {
      ...bookshelf[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: failMessage + 'Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (req, h) => {
  const {id} = req.params;
  const index = bookshelf.findIndex((b) => {
    return b.id === id;
  });

  if (index > -1) {
    bookshelf.splice(index, 1);

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  insertBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
