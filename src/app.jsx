import { useState, useEffect } from 'react';
import axios from 'axios';

export function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [calculatorItems, setCalculatorItems] = useState([
    { name: '', quantity: '' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://docs.google.com/spreadsheets/d/e/2PACX-1vQb62GvGs9vUbbdyvXCbfap3XxtX2U25k4sUmfNspTw_RfYCiSMLaSEh4HCUlmhHCoSPFnHynggo38T/pub?gid=1364255641&single=true&output=csv'
        );

        const rows = response.data.split('\n').slice(1);
        const data = rows.map(row => {
          const cols = row.split(',');

          const product = cols[0]?.trim();
          const price = parseFloat(cols[1]);
          const measure = cols[2]?.trim();
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
    if (searchTerm.trim() === '') {
      setProductResults([]);
      return;
    }

    const term = searchTerm.trim().toLowerCase();

    const filtered = products.filter(p =>
      p.product.toLowerCase().includes(term)
    );

    const startsWithTerm = filtered.filter(p =>
      p.product.toLowerCase().startsWith(term)
    );

    const others = filtered.filter(p =>
      !p.product.toLowerCase().startsWith(term)
    );

    const sortBySecondWordThenPrice = (a, b) => {
      const aWords = a.product.toLowerCase().split(' ');
      const bWords = b.product.toLowerCase().split(' ');

      const secondA = aWords[1] || '';
      const secondB = bWords[1] || '';

      if (secondA < secondB) return -1;
      if (secondA > secondB) return 1;

      return a.price - b.price;
    };

    const sorted = [
      ...startsWithTerm.sort(sortBySecondWordThenPrice),
      ...others.sort(sortBySecondWordThenPrice),
    ];

    setProductResults(sorted);
  };

  const handleCalculatorChange = (index, field, value) => {
    const newItems = [...calculatorItems];
    newItems[index][field] = value;
    setCalculatorItems(newItems);
  };

  const addCalculatorItem = () => {
    setCalculatorItems([...calculatorItems, { name: '', quantity: '' }]);
  };

  const getLowestPrice = (productName) => {
    const matches = products.filter(
      p => p.product.toLowerCase() === productName.toLowerCase()
    );
    if (matches.length === 0) return null;
    return matches.reduce((min, current) =>
      current.price < min.price ? current : min
    );
  };

  const calculateCost = (name, quantity) => {
    const product = getLowestPrice(name);
    if (!product || isNaN(quantity)) return '-';
    const cost = (parseFloat(quantity) / 1000) * product.price;
    return `${cost.toFixed(2)}€`;
  };

  // ------------- FUNÇÃO DE REMOVER ITEM --------------
    const removeCalculatorItem = (index) => {
      const updatedItems = [...calculatorItems];
      updatedItems.splice(index, 1); // Remove o item na posição do índice
      setCalculatorItems(updatedItems); // Atualiza o estado com a lista de itens modificada
  };

  return (
    <div className="App">
    
    <h1
      style={{
        color: '#5e503f',
        textAlign: 'center',
        fontSize: '2.5rem',
        marginBottom: '1rem'
      }}
    >
      Valor do Prato
    </h1>

       <table style={{ margin: '0 auto', color: '#22333b', textAlign: 'center' }}>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Medida (g/ml)</th>
            <th>Preço/kg</th>
            <th style={{ paddingLeft: '20px' }}>Custo</th>
          </tr>
        </thead>



        <tbody>
          {calculatorItems.map((item, index) => {
            const product = getLowestPrice(item.name);
            return (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleCalculatorChange(index, 'name', e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleCalculatorChange(index, 'quantity', e.target.value)
                    }
                  />
                </td>
                <td>{product ? `${product.price.toFixed(2)}€` : '-'}</td>
                <td style={{ paddingLeft: '20px' }}>
                  {calculateCost(item.name, item.quantity)}
                </td>
                <td>
                  {/* Botão de remover (x) */}
                  <button
                    onClick={() => removeCalculatorItem(index)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff0000',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>


      </table>

      {/* Linha de total */}
      <div
        style={{
          marginTop: '20px',
          fontWeight: 'bold',
          color: '#5e503f',
          fontSize: '1.5rem',
          textAlign: 'right',
          marginRight: '10%',
        }}
      >
        Total:{' '}
        {
          calculatorItems.reduce((acc, item) => {
            const product = getLowestPrice(item.name);
            const quantity = parseFloat(item.quantity);
            if (!product || isNaN(quantity)) return acc;
            const cost = (quantity / 1000) * product.price;
            return acc + cost;
          }, 0).toFixed(2)
        }€
      </div>

      {/* Linha total com 20% acrescimo*/}
      <div
        style={{
          marginTop: '10px',
          fontWeight: 'bold',
          color: '#5e503f',
          fontSize: '14px',
          textAlign: 'right',
        }}
      >
        Total com desperdício: {' '}
        <span
          style={{
            fontSize: '100%', // diminui a fonte pela metade
            color: '#5e503f', // cor para o texto total com desperdício
          }}
        >
          {
            (
              calculatorItems.reduce((acc, item) => {
                const product = getLowestPrice(item.name);
                const quantity = parseFloat(item.quantity);
                if (!product || isNaN(quantity)) return acc;
                const cost = (quantity / 1000) * product.price;
                return acc + cost;
              }, 0) * 1.2 // aplica 20% de aumento (desperdício)
            ).toFixed(2)
          }€
        </span>
      </div>


      {/* Linha total com 20% de acréscimo e multiplicado por 3 */}
      <div
        style={{
          marginTop: '10px',
          fontWeight: 'bold',
          color: '#5e503f',
          fontSize: '14px',
          textAlign: 'right',
        }}
      >
        Valor Sugerido para Cliente Final: {' '}
        <span
          style={{
            fontSize: '100%', // mantém a fonte normal
            color: '#5e503f', // cor para o texto do valor sugerido
          }}
        >   
          {
            (
              calculatorItems.reduce((acc, item) => {
                const product = getLowestPrice(item.name);
                const quantity = parseFloat(item.quantity);
                if (!product || isNaN(quantity)) return acc;
                const cost = (quantity / 1000) * product.price;
                return acc + cost;
              }, 0) * 1.2 * 3 // aplica 20% de aumento (desperdício) e depois multiplica por 3
            ).toFixed(2)
          }€
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px', paddingLeft: '10%' }}>
        <button
          onClick={addCalculatorItem}
          style={{
            backgroundColor: '#fefdeb',
            border: '1px solid #ccc',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#5e503f',
            transition: 'background-color 0.2s ease',
          }}
          onMouseDown={e => e.currentTarget.style.backgroundColor = '#e0d8c8'}
          onMouseUp={e => e.currentTarget.style.backgroundColor = '#faf4ea'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#faf4ea'}
        >
          + Adicionar Produto
        </button>
      </div>
      <hr />

      
      <h2
        style={{
          color: '#606c38',
          textAlign: 'Left',
          fontSize: '1.5rem',
          marginBottom: '1rem'
        }}
      >
        Pesquisa de Produtos
      </h2>

      

      <div>
        {/* Caixa de entrada para o nome do produto */}
        <input
          type="text"
          placeholder="Digite o nome do produto"
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          style={{
            width: '200px', // Aumenta o tamanho da caixa de texto
            padding: '10px', // Deixa a caixa mais confortável para digitar
            border: '2px solid #606c38', // Borda mais grossa e colorida
            borderRadius: '5px', // Borda arredondada
            color: '#606c38', // Cor do texto
            fontSize: '16px', // Tamanho da fonte maior
            marginRight: '10px', // Espaçamento à direita
          }}
        />
  
        {/* Botão de buscar produtos */}
        <button
          onClick={handleSearch}
          style={{
            backgroundColor: '#fefdeb',
            border: '1px solid #ccc',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#5e503f',
            transition: 'background-color 0.2s ease',
          }}
          onMouseDown={e => e.currentTarget.style.backgroundColor = '#e0d8c8'}
          onMouseUp={e => e.currentTarget.style.backgroundColor = '#faf4ea'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#faf4ea'}
        >
          Buscar Produtos
        </button>
      </div>

      {productResults.length > 0 ? (
        <div>


          <h3
            style={{
              color: '#606c38',
              textAlign: 'Left',
              fontSize: '1.3rem',
              marginBottom: '1rem'
            }}
          >
            Resultados da Busca:
          </h3>

          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ color: '#283618' }}>
                <th style={{ textAlign: 'left' }}>Produto</th>
                <th style={{ textAlign: 'center' }}>Preço</th>
                <th style={{ textAlign: 'center' }}>Medida</th>
                <th style={{ textAlign: 'center' }}>Mercado</th>
              </tr>
            </thead>
            <tbody>
              {productResults.map((product, index) => (
                <tr key={index}>
                  <td>{product.product}</td>
                  <td style={{ textAlign: 'center' }}>{product.price.toFixed(2)}€</td>
                  <td style={{ textAlign: 'center' }}>{product.measure}</td>
                  <td style={{ textAlign: 'center' }}>{product.market}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Caso não tenha produtos encontrados */}
          {searchTerm && productResults.length === 0 && (
            <p
              style={{
                color: '#283618',
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Nenhum produto encontrado para "{searchTerm}"
  </p>
)}

        </div>
      ) : (
        searchTerm && <p>Nenhum produto encontrado para "{searchTerm}".</p>
      )}
    </div>
  );
}
