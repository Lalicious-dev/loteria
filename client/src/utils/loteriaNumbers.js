// src/utils/loteriaNumbers.js
export const loteriaCardsMap = {
    'The Hummingbird': { 
        number: 1, 
        phonetic: '/ˈhʌmɪŋbɜːrd/' 
    },
    'The Little Devil': { 
        number: 2, 
        phonetic: '/ˈlɪtəl ˈdɛvəl/' 
    },
    'The Lady': { 
        number: 3, 
        phonetic: '/ˈleɪdi/' 
    },
    'The Catrin': { 
        number: 4, 
        phonetic: '/kɑːˈtrin/' 
    },
    'The Umbrella': { 
        number: 5, 
        phonetic: '/ʌmˈbrɛlə/' 
    },
    'The Avocado': { 
        number: 6, 
        phonetic: '/ˌævəˈkɑːdoʊ/' 
    },
    'The Ladder': { 
        number: 7, 
        phonetic: '/ˈlædər/' 
    },
    'The Bottle': { 
        number: 8, 
        phonetic: '/ˈbɑːtəl/' 
    },
    'The Barrel': { 
        number: 9, 
        phonetic: '/ˈbærəl/' 
    },
    'The Tree': { 
        number: 10, 
        phonetic: '/triː/' 
    },
    'The Melon': { 
        number: 11, 
        phonetic: '/ˈmɛlən/' 
    },
    'The Otter': { 
        number: 12, 
        phonetic: '/ˈɑːtər/' 
    },
    'The Coin': { 
        number: 13, 
        phonetic: '/kɔɪn/' 
    },
    'The Arduino': { 
        number: 14, 
        phonetic: '/ɑːrˈdwiːnoʊ/' 
    },
    'The Pear': { 
        number: 15, 
        phonetic: '/pɛr/' 
    },
    'The Flag': { 
        number: 16, 
        phonetic: '/flæɡ/' 
    },
    'The Big Mandolin': { 
        number: 17, 
        phonetic: '/bɪɡ ˈmændəlɪn/' 
    },
    'The Cello': { 
        number: 18, 
        phonetic: '/ˈtʃɛloʊ/' 
    },
    'The Panther': { 
        number: 19, 
        phonetic: '/ˈpænθər/' 
    },
    'The Hen': { 
        number: 20, 
        phonetic: '/hɛn/' 
    },
    'The Hand': { 
        number: 21, 
        phonetic: '/hænd/' 
    },
    'The Boot': { 
        number: 22, 
        phonetic: '/buːt/' 
    },
    'The Moon': { 
        number: 23, 
        phonetic: '/muːn/' 
    },
    'The LED': { 
        number: 24, 
        phonetic: '/ˌɛl iː ˈdiː/' 
    },
    'The Witch': { 
        number: 25, 
        phonetic: '/wɪtʃ/' 
    },
    'The Black Man': { 
        number: 26, 
        phonetic: '/blæk mæn/' 
    },
    'The Heart': { 
        number: 27, 
        phonetic: '/hɑːrt/' 
    },
    'The Watermelon': { 
        number: 28, 
        phonetic: '/ˈwɔːtərˌmɛlən/' 
    },
    'The Drum': { 
        number: 29, 
        phonetic: '/drʌm/' 
    },
    'The Shrimp': { 
        number: 30, 
        phonetic: '/ʃrɪmp/' 
    },
    'The Arrows': { 
        number: 31, 
        phonetic: '/ˈæroʊz/' 
    },
    'The Headphones': { 
        number: 32, 
        phonetic: '/ˈhɛdfoʊnz/' 
    },
    'The Spider': { 
        number: 33, 
        phonetic: '/ˈspaɪdər/' 
    },
    'The Soldier': { 
        number: 34, 
        phonetic: '/ˈsoʊldʒər/' 
    },
    'The Star': { 
        number: 35, 
        phonetic: '/stɑːr/' 
    },
    'The Saucepan': { 
        number: 36, 
        phonetic: '/ˈsɔːspæn/' 
    },
    'The World': { 
        number: 37, 
        phonetic: '/wɜːrld/' 
    },
    'The Apache': { 
        number: 38, 
        phonetic: '/əˈpætʃi/' 
    },
    'The Nopal': { 
        number: 39, 
        phonetic: '/ˈnoʊpəl/' 
    },
    'The Snake': { 
        number: 40, 
        phonetic: '/sneɪk/' 
    },
    'The Rose': { 
        number: 41, 
        phonetic: '/roʊz/' 
    },
    'The Skull': { 
        number: 42, 
        phonetic: '/skʌl/' 
    },
    'The Bell': { 
        number: 43, 
        phonetic: '/bɛl/' 
    },
    'The Michelada': { 
        number: 44, 
        phonetic: '/mitʃeˈlada/' 
    },
    'The Deer': { 
        number: 45, 
        phonetic: '/dɪr/' 
    },
    'The Sun': { 
        number: 46, 
        phonetic: '/sʌn/' 
    },
    'The Crown': { 
        number: 47, 
        phonetic: '/kraʊn/' 
    },
    'The Chalupa': { 
        number: 48, 
        phonetic: '/tʃəˈluːpə/' 
    },
    'The Pine Tree': { 
        number: 49, 
        phonetic: '/paɪn triː/' 
    },
    'The Fish': { 
        number: 50, 
        phonetic: '/fɪʃ/' 
    },
    'The Tamal': { 
        number: 51, 
        phonetic: '/tɑːˈmɑːl/' 
    },
    'The Flowerpot': { 
        number: 52, 
        phonetic: '/ˈflaʊərpɑːt/' 
    },
    'The Talachas': { 
        number: 53, 
        phonetic: '/tɑːˈlɑːtʃɑːs/' 
    },
    'The Frog': { 
        number: 54, 
        phonetic: '/frɑːɡ/' 
    }
};

// Funciones helper
export const getCardInfo = (cardName) => {
    return loteriaCardsMap[cardName] || { number: null, phonetic: '' };
};

export const getCardNumber = (cardName) => {
    return loteriaCardsMap[cardName]?.number || null;
};

export const getCardPhonetic = (cardName) => {
    return loteriaCardsMap[cardName]?.phonetic || '';
};