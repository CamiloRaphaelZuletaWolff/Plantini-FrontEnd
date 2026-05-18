import React from 'react';
import { Image } from 'react-native';

export const ONBOARDING_STEPS = [
{
    key: 'welcome',
    title: 'Bienvenido a VoluntariadoUPB',
    subtitle: 'Únete a nuestra comunidad y marca la diferencia.',
    image: (
    <Image
        source={require('../../assets/Onboarding/1.bienvenido.png')}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
    />
    ),
    backgroundColor: '#fff',
},
{
    key: 'opportunities',
    title: 'Descubre Oportunidades',
    subtitle: 'Explora proyectos de voluntariado que se adapten a ti.',
    image: (
    <Image
        source={require('../../assets/Onboarding/2.descubre.png')}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
    />
    ),
    backgroundColor: '#fff',
},
{
    key: 'apply',
    title: 'Postúlate Fácilmente',
    subtitle: 'Aplica a tus proyectos favoritos en pocos pasos.',
    image: (
    <Image
        source={require('../../assets/Onboarding/3.postulate.png')}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
    />
    ),
    backgroundColor: '#fff',
},
{
    key: 'plantini',
    title: 'Plantini',
    subtitle: 'Tu asistente y amigo para dudas sobre la app y tus oportunidades.',
    image: (
    <Image
        source={require('../../assets/Onboarding/4.plantini.png')}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
    />
    ),
    backgroundColor: '#fff',
},
{
    key: 'ready',
    title: '¡Todo Listo!',
    subtitle: 'Comienza tu aventura como voluntario.',
    image: (
    <Image
        source={require('../../assets/Onboarding/5.listo.png')}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
    />
    ),
    backgroundColor: '#fff',
},
];
