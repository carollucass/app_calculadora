import { useState, useEffect } from 'react';
import axios from 'axios';

export function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://docs.google.com/spreadsheets/d/e/2PACX-1vQb62GvGs9vUbbdyvXCbfap3XxtX2U25k4sUmfNspTw_RfYCiSMLaSEh4HCUlmhHCoSPFnHynggo38T/pub?gid=1364255641&single=true&output=csv'
        );

        const rows = response.data.split('\n').slice(1); // Remove cabeçalho
        const data = rows.map(row => {
          const cols = row.split(',');

          const product = cols[0]?.trim();
          const price = parseFloat(cols[1]);
          const measure = cols[2]?.trim(); // Agora pegando como texto
          const market = cols[5]?.trim();

          return {
            product,
            price: !isNaN(price) ? price : 0,
            measure: measure || '',
            market: market || 'Desconhecido'
          };
        });

        setProducts(data);
      } catch (error) {
        console.error('Erro ao buscar dados: ', error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (searchTerm === '') {
      setProductResults([]);
    } else {
      const filteredProducts = products.filter(product =>
        product.product.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const exactMatch = filteredProducts.filter(product =>
        product.product.toLowerCase() === searchTerm.toLowerCase()
      );

      const twoWordsMatch = filteredProducts.filter(product =>
        product.product.toLowerCase().split(' ').length === 2 &&
        product.product.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const moreWordsMatch = filteredProducts.filter(product =>
        product.product.toLowerCase().split(' ').length > 2 &&
        product.product.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const sortedResults = [
        ...exactMatch.sort((a, b) => a.price - b.price),
        ...twoWordsMatch.sort((a, b) => a.price - b.price),
        ...moreWordsMatch.sort((a, b) => a.price - b.price)
      ];

      setProductResults(sortedResults);
    }
  };

  return (
    <div className="App">
      <h1>Pesquisa de Produtos</h1>

      <div>
        <input
          type="text"
          placeholder="Digite o nome do produto"
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar Produtos</button>
      </div>

      {productResults.length > 0 ? (
        <div>
          <h3>Resultados da Busca:</h3>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Medida</th>
                <th>Mercado</th>
              </tr>
            </thead>
            <tbody>
              {productResults.map((product, index) => (
                <tr key={index}>
                  <td>{product.product}</td>
                  <td>{product.price.toFixed(2)}€</td>
                  <td>{product.measure}</td>
                  <td>{product.market}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Nenhum produto encontrado para "{searchTerm}".</p>
      )}
    </div>
  );
}
