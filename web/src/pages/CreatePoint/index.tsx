import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api';

import './styles.css'
import logo from '../../assets/logo.svg'

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint = () => {
    const [items, setItems] = useState<Array<Item>>([]);
    const [ufs, setUfs] = useState<Array<string>>([]);
    const [cities, setCities] = useState<Array<string>>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([-23.556074499999998, -46.410486899999995]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            
            setInitialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data);
        });
    },[]);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            
            const ufInitials = res.data.map(uf => uf.sigla);
            
            setUfs(ufInitials);
        })
    },[]);

    useEffect(() => {
        if(selectedUf === '0') {
            return
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
            const cityNames = res.data.map(city => city.nome);
            setCities(cityNames);
        })
    }, [selectedUf]);

    function handleSelectUf(e: ChangeEvent<HTMLSelectElement>) {
        const uf = e.target.value;
        setSelectedUf(uf);
    }

    function handleSelectCity(e: ChangeEvent<HTMLSelectElement>) {
        const city = e.target.value;
        setSelectedCity(city);
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id)
        
        if(alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }
        else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        console.log("Submit");

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };
        console.log(data);

        await api.post('points', data);

        alert("Ponto de coleta criado");

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/>ponto de coleta</h1>

                {/* ESPA??O PARA COLOCAR UPLOAD DE IMAGEM */}

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange} />
                    </div>

                    
                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" name="email" id="email" onChange={handleInputChange} />
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                    </div>
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend>
                        <h2>Endere??o</h2>
                        <span>Selecione o endere??o no mapa</span>
                    </legend>

                    <MapContainer center={initialPosition} zoom={15} 
                    whenCreated={(map) => {
                        map.on("click", function (e: LeafletMouseEvent) {
                          const { lat, lng } = e.latlng;
                          
                          setSelectedPosition([
                              lat, lng
                          ]);
                        });}}>
                        <TileLayer 
                         attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                         <Marker position={selectedPosition}></Marker>                         
                    </MapContainer>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option value={uf} key={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(cities => (
                                    <option value={cities} key={cities}>{cities}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => handleSelectItem(item.id)} className={selectedItems.includes(item.id) ? 'selected': ''}>
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>)
                        )}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;