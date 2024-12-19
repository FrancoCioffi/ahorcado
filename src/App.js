import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [palabra, setPalabra] = useState('');
    const [palabraSinAcentos, setPalabraSinAcentos] = useState('');
    const [oculta, setOculta] = useState('');
    const [errores, setErrores] = useState(0);
    const [imagenActual, setImagenActual] = useState(0);
    const [letrasIntentadas, setLetrasIntentadas] = useState([]);
    const [score, setScore] = useState(60); // Nuevo estado para el puntaje
    const [nombre, setNombre] = useState(''); // Nuevo estado para el nombre del jugador
    const [puntuaciones, setPuntuaciones] = useState([]); // Estado para almacenar las puntuaciones


    // Lista de imágenes del ahorcado
    const imagenes = [
        'ahorcado0.png', 'ahorcado1.png', 'ahorcado2.png', 'ahorcado3.png', 'ahorcado4.png', 'ahorcado5.png', 'ahorcado6.png',
    ];
    // Función para eliminar acentos
    const eliminarAcentos = (texto) => {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    // Función para obtener una palabra desde la API
    const obtenerPalabra = async () => {
        try {
            const response = await axios.get(
                'https://clientes.api.greenborn.com.ar/public-random-word'
            );
            console.log('Respuesta de la API:', response.data[0]); // Verificar la respuesta
            if (response.data) {
                const nuevaPalabra = response.data[0];
                setPalabra(nuevaPalabra);
                setPalabraSinAcentos(eliminarAcentos(nuevaPalabra));
                setOculta('_ '.repeat(response.data[0].length).trim());
            } else {
                console.error('La API no devolvió una palabra válida.');
            }
        } catch (error) {
            console.error('Error al obtener la palabra:', error);
        }
    };

    const obtenerPuntuaciones = async () => {
        try {
            const response = await axios.get('http://localhost:5000/puntuaciones');
            setPuntuaciones(response.data);
        } catch (error) {
            console.error('Error al obtener las puntuaciones:', error);
        }
    };

    // Llamar a obtenerPalabra y obtenerPuntuaciones al cargar la aplicación
    useEffect(() => {
        obtenerPalabra();
        obtenerPuntuaciones();
    }, []);

    // Función para manejar las letras seleccionadas del teclado
    const manejarIntento = (letra) => {

        setLetrasIntentadas((prev) => [...prev, letra]);

        if (palabraSinAcentos.includes(letra)) {
            // Actualizar palabra oculta con la letra correcta
            const nuevaOculta = palabra
                .split('')
                .map((char, idx) =>
                    letrasIntentadas.includes(eliminarAcentos(char)) || eliminarAcentos(char) === letra
                        ? char
                        : '_'
                )
                .join(' ');
            setOculta(nuevaOculta);

            if (!nuevaOculta.includes('_')) {
                alert(`¡Felicidades, has ganado! Tu puntaje final es: ${score}`);
                guardarPuntaje(nombre, score);
            }
        } else {
            setErrores((prev) => prev + 1);
            setImagenActual((prev) => Math.min(prev + 1, imagenes.length - 1));
            setScore((prev) => Math.max(prev - 10, 0));

            if (errores + 1 >= 6) {
                alert(`Has perdido. La palabra era: ${palabra}. Tu puntaje final es: ${score}`);
                guardarPuntaje(nombre, score);
            }
        }
    };

    const guardarPuntaje = async (nombre, score) => {
        try {
            await axios.post('http://localhost:5000/puntuaciones', {
                nombre: nombre,
                puntaje: score,
            });
            alert('Puntaje guardado exitosamente');
        } catch (error) {
            console.error('Error al guardar el puntaje:', error);
        }
    };

    const generarTeclado = () => {
        const letras = 'abcdefghijklmnñopqrstuvwxyz'.split('');
        return letras.map((letra) => (
            <button
                key={letra}
                onClick={() => manejarIntento(letra)}
                disabled={letrasIntentadas.includes(letra)}
                style={{
                    margin: '5px',
                    padding: '10px',
                    backgroundColor: letrasIntentadas.includes(letra) ? '#ccc' : '#f0f0f0',
                    cursor: letrasIntentadas.includes(letra) ? 'not-allowed' : 'pointer',
                }}
            >
                {letra}
            </button>
        ));
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Juego del Ahorcado</h1>
            <p>Errores: {errores}/6</p>
            <p>Puntaje: {score}</p>
            <img
                src={imagenes[imagenActual]}
                alt="Estado del ahorcado"
                style={{ width: '200px', height: '300px' }}
            />
            <p>Palabra oculta: {oculta}</p>
            <div style={{ margin: '20px' }}>{generarTeclado()}</div>
            <input
                type="text"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ marginBottom: '10px', padding: '5px' }}
            />
            <h2>Tabla de Puntuaciones</h2>
            <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '50%' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '5px' }}>Nombre</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>Puntaje</th>
                    </tr>
                </thead>
                <tbody>
                    {puntuaciones.map((puntuacion, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid black', padding: '5px' }}>{puntuacion.nombre}</td>
                            <td style={{ border: '1px solid black', padding: '5px' }}>{puntuacion.puntaje}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default App;