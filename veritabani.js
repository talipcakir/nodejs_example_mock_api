let mysql = require('mysql');

let con = mysql.createConnection({
	host: 'localhost',
	port: '3306',
	user: 'root',
	password: 'root',
  database: 'nodejs_example_db'
});

let productTablosuOlustur = `CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image VARCHAR(255)
);`

con.connect(function (err) {
	if (err) throw err;
	console.log('Veritabanı bağlantısı başarılı!');

	if (err) throw err;
	console.log('Connected!');
  con.query(productTablosuOlustur, function (err, result) {
    if (err) throw err;
    console.log("Product tablosu oluşturuldu veya zaten mevcut.");
  });
});