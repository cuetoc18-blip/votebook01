/**
 * Módulo Estructura — Coordinador → Líder → Amigos
 * © 2026 Carlos Cueto Mejía
 */
(function (global) {
  'use strict';

  function createEstructura() {
    let data = { coordinadores: [] };
    const STORAGE_KEY = 'estructura_organizacional_v1';

    function capitalizarNombre(s) {
      s = String(s || '').replace(/\s+/g, ' ').trim();
      if (!s) return '';
      var mini = { de: 1, del: 1, la: 1, las: 1, los: 1, y: 1, e: 1, da: 1, das: 1, do: 1, dos: 1 };
      return s.split(' ').map(function (w, i) {
        var low = w.toLowerCase();
        if (i > 0 && mini[low]) return low;
        return low.charAt(0).toUpperCase() + low.slice(1);
      }).join(' ');
    }

    // Barrios de Barranquilla por Localidad (fuente: Alcaldía de Barranquilla)
    const BARRIOS_POR_LOCALIDAD = {
      'Norte-Centro Histórico': [
        'Abajo','Alameda del Río','Altos del Prado','América','Barlovento','Bellavista','Betania','Boston',
        'Campo Alegre','Centro','Ciudad Jardín','Colombia','El Castillo','El Golf','El Porvenir','El Prado',
        'El Recreo','El Rosario','El Tabor','Granadillo','La Campiña','La Concepción','La Cumbre','La Loma',
        'Las Delicias','Las Mercedes','Las Nubes','Los Alpes','Los Jobos','Los Nogales','Miramar','Modelo',
        'Montecristo','Nuevo Horizonte','Paraíso','San Francisco','Santa Ana','Villa Country','Villanueva',
        'Zona Franca','Zona Industrial'
      ],
      'Riomar': [
        'Adela de Char','Altamira','Altos de Riomar','Altos del Limón','Andalucía','Buenavista','El Castillo I',
        'El Limoncito','El Poblado','La Castellana','La Floresta','Las Flores','Las Tres Avemarías','Miramar',
        'Paraíso','Riomar','San Salvador','San Vicente','Santa Mónica','Siape','Villa Campestre','Villa Carolina',
        'Villa del Este','Villa Santos'
      ],
      'Metropolitana': [
        'Buenos Aires','Carrizal','Cevillar','Ciudadela 20 de Julio','El Santuario','Kennedy','La Sierra',
        'La Sierrita','Las Américas','Las Cayenas','Las Gardenias','Las Granjas','Los Continentes','Los Girasoles',
        'Puerta Dorada','San Luis','Santa María','Santo Domingo de Guzmán','Sevilla Real','Siete de Abril',
        'Sinaí','Veinte de Julio','Villa San Carlos','Villa San Pedro','Villa Sevilla','Villa Valery'
      ],
      'Suroriente': [
        'Atlántico','Bellarena','Boyacá','Chiquinquirá','El Campito','El Limón','El Milagro','El Parque',
        'José Antonio Galán','La Alboraya','La Chinita','La Luz','La Magdalena','La Unión','La Victoria',
        'Las Dunas','Las Nieves','Las Palmeras','Las Palmas','Los Laureles','Los Trupillos','Moderno','Montes',
        'Pasadena','Primero de Mayo','Rebolo','San José','San Nicolás','San Roque','Santa Helena','Simón Bolívar',
        'Tayrona','Universal I','Universal II','Villa Blanca','Villa del Carmen'
      ],
      'Suroccidente': [
        'Alfonso López','Bernardo Hoyos','Buena Esperanza','California','Caribe Verde','Carlos Meisel',
        'Ciudad Modesto','Ciudadela de la Salud','Ciudadela de Paz','Colina Campestre','Cordialidad',
        'Corregimiento de Juan Mina','Cuchilla de Villate','El Bosque','El Carmen','El Edén','El Pueblo',
        'El Romance','El Rubí','El Silencio','El Valle','Evaristo Sourdis','Kalamary','La Ceiba','La Esmeralda',
        'La Florida','La Gloria','La Libertad','La Manga','La Paz','La Pradera','Las Colinas','Las Estrellas',
        'Las Malvinas','Las Terrazas','Lipaya','Loma Fresca','Los Andes','Los Ángeles I','Los Ángeles II',
        'Los Ángeles III','Los Olivos I','Los Olivos II','Los Pinos','Los Rosales','Lucero','Me Quejo',
        'Mercedes Sur','Nueva Colombia','Nueva Granada','Olaya','Pinar del Río','Por Fin','Pumarejo',
        'San Felipe','San Isidro','San Pedro Alejandrino','Siete de Agosto','Villa del Rosario','Villa Flor'
      ]
    };
    const ERRORES_KEY = 'estructura_errores_cedulas_v1';
    // Puestos de votación IDC 2026 Barranquilla (oficial + alias)
    const PUESTOS_OFICIALES_BAQ = [{"zona":"01","puesto_num":"02","nombre":"IDETH SEDE PRINCIPAL SEDE II","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CALLE 63B N°28 87"},{"zona":"01","puesto_num":"03","nombre":"COL.DTAL OLAYA(ANT C.E.B.108)","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 70 B #27-36"},{"zona":"01","puesto_num":"04","nombre":"COL DISTRITAL MARIA INMACULADA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"KR 29 #70B-60"},{"zona":"02","puesto_num":"01","nombre":"IE DISTRITAL LA MERCED","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 57 No 30-23"},{"zona":"02","puesto_num":"03","nombre":"IED KARL PARRISH","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 27 No 47-171"},{"zona":"02","puesto_num":"04","nombre":"COL.CAMILO TORRES","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CARRERA 35 No. 51B - 37"},{"zona":"03","puesto_num":"02","nombre":"COLEGIO AMERICANO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CARRERA 38 No. 74 -179"},{"zona":"03","puesto_num":"03","nombre":"IED CARLOS MEISEL","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 74 No 24-139"},{"zona":"03","puesto_num":"04","nombre":"C.DTAL.EL SILENCIO(ANT CEB 050","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 73 C #26 B 2-55"},{"zona":"04","puesto_num":"01","nombre":"I.E.D. JAVIER SANCHEZ","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 63C #20B-28"},{"zona":"04","puesto_num":"04","nombre":"COL.DTAL.LA SALLE","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 70 C #18-47"},{"zona":"05","puesto_num":"02","nombre":"IDETH SEDE I PRIMARIA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 26 No 56 A 14"},{"zona":"05","puesto_num":"03","nombre":"IED SALVADOR SUAREZ SUAREZ","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 25B No 55 - 12"},{"zona":"05","puesto_num":"04","nombre":"JORGE NICOLAS ABELLO SD 2","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 64 No 24C-82"},{"zona":"06","puesto_num":"01","nombre":"I.E.D.INOCENCIO CHINCA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 53-D- #21B-181"},{"zona":"06","puesto_num":"03","nombre":"IED SALVADOR ENTREGAS","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 58 No 20B -40"},{"zona":"07","puesto_num":"01","nombre":"COLEGIO DISTRITAL MARIE POUSSEPIN","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 51 No 20-103"},{"zona":"07","puesto_num":"02","nombre":"IED DAVID SANCHEZ JULIAO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 64C No 16-30"},{"zona":"08","puesto_num":"01","nombre":"INST.LAS MERCEDES COL.SAN PABL","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 106 #12F-50"},{"zona":"08","puesto_num":"02","nombre":"COLEGIO CRISTIANO PENIEL","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CALLE 107 No. 12F-25"},{"zona":"08","puesto_num":"04","nombre":"COLEGIO SANTA MARIA DE LA PROVIDENCIA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"Carrera 10 No 98B 07"},{"zona":"08","puesto_num":"05","nombre":"FUNDACION CE CAMILO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 100 No 12F-35"},{"zona":"09","puesto_num":"02","nombre":"COL MANUEL ELKIN PATARROYO SD 1","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 26 No 85-61"},{"zona":"10","puesto_num":"01","nombre":"COL. TEC. SAN CARLOS BORROMEO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"Calle 112E No.22-10"},{"zona":"10","puesto_num":"03","nombre":"IED BETSABE ESPINOSA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"Calle 120 No 25 77"},{"zona":"11","puesto_num":"01","nombre":"CENTRO DE EDUCACION BASICA C.E.B.161","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 118 No 10J - 72"},{"zona":"11","puesto_num":"03","nombre":"NODO SENA CONSTRUCCION","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"DIAGONAL 136 No 9G - 20"},{"zona":"11","puesto_num":"04","nombre":"MEGA COLEGIO IED VILLAS DE SAN PABLO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"DIAGONAL 136 No 9 D - 60"},{"zona":"11","puesto_num":"05","nombre":"COL ALBERTO ASSA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CALLE 101 No. 6L - 170"},{"zona":"12","puesto_num":"01","nombre":"COL. JOSE RAIMUNDO SOJO (MEGA)","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"Carrera 9J 1 Calle 78 Diagonal 70C"},{"zona":"12","puesto_num":"03","nombre":"E.D.EVARISTO SOURDIS SEDE 2","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CALLE 75 No. 9A - 23"},{"zona":"13","puesto_num":"02","nombre":"IED LA ESMERALDA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 84B No 13E - 26"},{"zona":"13","puesto_num":"03","nombre":"INST. EDUCATIVA EVARDO TURIZO PALENCIA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 13 No 84-14"},{"zona":"14","puesto_num":"02","nombre":"IED ESPERANZA DEL SUR","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 8C No 93-92"},{"zona":"14","puesto_num":"04","nombre":"IED LOS ROSALES","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 98D No 9J-23"},{"zona":"15","puesto_num":"01","nombre":"INS.TEC.DIST.CRUZADA SOCIAL","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CLL 55 #13C-57"},{"zona":"15","puesto_num":"02","nombre":"INST EDUC DIST SIMON BOLIVAR","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CL 46B #14-27"},{"zona":"15","puesto_num":"03","nombre":"IEDT MEIRA DELMAR SD 2 (ANT. CEB MEDIA)","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"KR 13 #45C 5-19"},{"zona":"16","puesto_num":"01","nombre":"COL DIST DE B/QUILLA GABRIEL GARCIA M","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CLL 45B No 19-141"},{"zona":"16","puesto_num":"02","nombre":"I.E.D.LA VICTORIA","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CARRERA 10C No. 45-46"},{"zona":"16","puesto_num":"03","nombre":"NUEVO COL. TEC. DEL SANTUARIO.","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Calle 47B No. 8D-60"},{"zona":"17","puesto_num":"03","nombre":"I.D.E.STA.MARIA(MEGACOLEGIO)","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"KR 5 SUR #78B-80"},{"zona":"17","puesto_num":"04","nombre":"IED SANTO DOMINGO DE GUZMAN","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CRA 2 # 78-36"},{"zona":"18","puesto_num":"01","nombre":"I.E.D. SAN LUIS SEDE 2 (LAS GARDENIAS)","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"calle 98 N 2 sur 05"},{"zona":"18","puesto_num":"04","nombre":"IED DESPERTAR DEL SUR","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Carera 3B No 52B 28"},{"zona":"18","puesto_num":"05","nombre":"IED LAS GARDENIAS","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Calle 98C No 1E 99"},{"zona":"19","puesto_num":"01","nombre":"IED GERMAN VARGAS CANTILLO FE Y ALEGRIA","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Carrera 15 Sur No.46-500"},{"zona":"19","puesto_num":"03","nombre":"I.D.E.COL.CIUD.ESTUD.(ANT 186)","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CARRERA 1A No. 47 - 49"},{"zona":"19","puesto_num":"04","nombre":"I.E.D. REUVEN FEUERSTEIN","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Carrera 1B No.46G-18"},{"zona":"20","puesto_num":"01","nombre":"COL.MIGUEL ANGEL BUILES BLQ1","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"KR 2F #50D-27 CARRIZAL BLOQUE 1"},{"zona":"20","puesto_num":"02","nombre":"COL.MIGUEL ANGEL BUILES BLQ2","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"calle 50E N 2B-54"},{"zona":"20","puesto_num":"05","nombre":"IED TEC METROPOLITANO DE BARRANQUILLA","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Calle 46 No 1Sur 445"},{"zona":"21","puesto_num":"02","nombre":"COL.LA PRESENTACION","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 33 #33-194"},{"zona":"22","puesto_num":"01","nombre":"COL.TEC.DISTR.DE REBOLO","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"calle 6a N 32-05"},{"zona":"22","puesto_num":"02","nombre":"CENTRO SOCIAL DON BOSCO SD 2","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CLL 30 No 36-28 BARRIO SAN ROQUE"},{"zona":"22","puesto_num":"03","nombre":"COLEGIO MADRE MARIA SARA ALVARADO","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Calle 34 No 26 08"},{"zona":"22","puesto_num":"04","nombre":"IED COLEGIO SAGRADO CORAZON DE JESUS","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CRA 32 No 41-34"},{"zona":"23","puesto_num":"01","nombre":"SENA SAN JOSE MULTIPLE BILINGUE","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CLL 40B N 21 -142"},{"zona":"23","puesto_num":"02","nombre":"COL SAN JOSE SD 1","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Carrera 21 No. 39-10"},{"zona":"23","puesto_num":"03","nombre":"COL.DTAL.SAN GABRIEL SEDE No1","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Kra 19 No. 35-58"},{"zona":"23","puesto_num":"04","nombre":"I.E.D.LA UNION SEDE 2","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CARRERA 18 No. 36B - 105"},{"zona":"24","puesto_num":"02","nombre":"COL.OCTAVIO PAZ","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 1 F #41B-05"},{"zona":"24","puesto_num":"03","nombre":"I.E.D.LOS LAURELES","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CALLE 37C No. 1H - 10"},{"zona":"24","puesto_num":"04","nombre":"I.E.D.MARCO FIDEL SUAREZ","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 6B #36B-46"},{"zona":"25","puesto_num":"01","nombre":"I.E.D.NTRA.SRA. DE LAS NIEVES","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 10 #23-13"},{"zona":"25","puesto_num":"02","nombre":"COLEGIO SANTA TERESITA","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 19 #24-22"},{"zona":"25","puesto_num":"03","nombre":"I.E.D.CALIXTO ALVAREZ","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 15 #21-11"},{"zona":"25","puesto_num":"04","nombre":"IED JOSE MARTI","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CLL 17 No 8B-05"},{"zona":"26","puesto_num":"01","nombre":"INT.DTAL.CASTILLO LA ALBORAYA","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"calle 41b N 8a-42"},{"zona":"26","puesto_num":"02","nombre":"COL.DTAL.BUENOS AIRES\"CODIBA\"","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CALLE 44 CARRERA 5B ESQUINA"},{"zona":"26","puesto_num":"03","nombre":"COL.DTAL.MARIA AUXILIADORA","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 38B #7D-56"},{"zona":"26","puesto_num":"04","nombre":"COLEGIO DE COMFAMILIAR","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 37C KR 6 ESQ"},{"zona":"27","puesto_num":"01","nombre":"INST.ELENA DE CHAUVIN","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 20C #21-66"},{"zona":"27","puesto_num":"02","nombre":"I.E. DISTRITAL LAS NIEVES 1","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CRA 15 No 23-115"},{"zona":"27","puesto_num":"03","nombre":"COL.LAS NIEVES SEDE 2","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 27 #21B-27"},{"zona":"27","puesto_num":"05","nombre":"IED LA LUZ","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Carrera 23 Calle 12 Esquina"},{"zona":"28","puesto_num":"01","nombre":"I E D BARRIO SIMON BOLIVAR BTO","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Carrera 5A No.19-15"},{"zona":"28","puesto_num":"02","nombre":"I.E.D.LUZ DEL CARIBE","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CALLE 27B No. 6A - 19"},{"zona":"28","puesto_num":"03","nombre":"COL.DISTRITAL JORGE ISAAC","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 4A #24B 3-21"},{"zona":"28","puesto_num":"04","nombre":"I.DIST.SIMON BOLIVAR PRIMARIA","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 17 KR 8 ESQ"},{"zona":"29","puesto_num":"01","nombre":"COLEGIO MAYOR DE BARRANQUILLA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CLL 44 No 44 - 97"},{"zona":"29","puesto_num":"02","nombre":"I.E.D.VILLANUEVA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 5 KR 42D-24"},{"zona":"29","puesto_num":"03","nombre":"IED BRISAS DEL RIO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"VIA 40 No 46A-50"},{"zona":"29","puesto_num":"04","nombre":"E.NOR.SUPERIOR DEL DTO BQUILLA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 47 #44-100"},{"zona":"29","puesto_num":"05","nombre":"INST.LA SALLE","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 47 #41-33"},{"zona":"30","puesto_num":"01","nombre":"INST. TEC.DE COMERCIO DE BARRANQUILLA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CLL 47 No 42-60"},{"zona":"30","puesto_num":"02","nombre":"IT DE COMERCIO DE BQUILLA SD 2","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CALLE 39 No 38-63"},{"zona":"30","puesto_num":"03","nombre":"I E D NUESTRA SEÑORA DEL ROSARIO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 43 No. 46-98"},{"zona":"30","puesto_num":"05","nombre":"COLEGIO ATENEO TECNICO COMERCIAL","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA 41 No 51 -111"},{"zona":"31","puesto_num":"01","nombre":"IU DE BARRANQUILLA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CR 45 No 48-31"},{"zona":"31","puesto_num":"02","nombre":"INST. TEC. NACIONAL DE COMERCIO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA 62 No 52 -85"},{"zona":"31","puesto_num":"03","nombre":"INST. TEC. NACIONAL DE COMERCIO SEDE 2","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CLL 52 No 62 - 06"},{"zona":"31","puesto_num":"04","nombre":"ID DE EDUCACION ARTISTICA Y CULTURAL ALE","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Calle 52 No 55 21"},{"zona":"31","puesto_num":"05","nombre":"ANTONIO JOSE DE SUCRE SEDE 1","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CLL 54 No 64 - 30"},{"zona":"31","puesto_num":"06","nombre":"COLISEO UNIVERSIDAD SIMON BOLIVAR SD 1","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA 54 No 58-132"},{"zona":"32","puesto_num":"02","nombre":"NUEVO COLEGIO DEL PRADO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"KR 62 #75-156"},{"zona":"32","puesto_num":"03","nombre":"IED LA CONCEPCION","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CARRERA 70 No 77A-27"},{"zona":"32","puesto_num":"04","nombre":"COLEGIO DEL SAGRADO CORAZON 74","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Calle 74 No 60 35"},{"zona":"32","puesto_num":"05","nombre":"CENTRO COMERCIAL LE MERIDIEM GOLF","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Carrera 59B No 81 158"},{"zona":"33","puesto_num":"03","nombre":"COL.NTRA.SEÑORA DE NAZARETH","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 81 #73-19"},{"zona":"33","puesto_num":"04","nombre":"COL.NTRA.SEÑORA DE LOURDES","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"KR 49 #70-122"},{"zona":"33","puesto_num":"05","nombre":"COL.BARRANQUILLA CODEBA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 68 #47-64"},{"zona":"33","puesto_num":"06","nombre":"IED SANTA BERNARDITA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CALLE 69D No 39 - 23"},{"zona":"34","puesto_num":"01","nombre":"COL.SAGRADA FAMILIA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 72 #38-79"},{"zona":"34","puesto_num":"03","nombre":"SEM.CONCILIAR SAN LUIS BELTRAN","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 75-B #42F-83"},{"zona":"34","puesto_num":"04","nombre":"COL.INST.ARIANO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CALLE 79 No. 42 - 318"},{"zona":"35","puesto_num":"03","nombre":"CORPORACION EL LITORAL SD I","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA. 42F No 79-110"},{"zona":"35","puesto_num":"04","nombre":"CENTRO COMERCIAL MIRAMAR","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA 43 No 99 50"},{"zona":"35","puesto_num":"05","nombre":"CENTRO COMERCIAL JARDIN DEL RIO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Calle No 114 No 42C 33"},{"zona":"36","puesto_num":"02","nombre":"COLEGIO EL BUEN CONCEJO","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CL 90 #53-95"},{"zona":"36","puesto_num":"04","nombre":"UNIVERSIDAD AUTONOMA DEL CARIBE","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CLL 90 No 46 - 112"},{"zona":"36","puesto_num":"06","nombre":"C. COMERCIAL Y EMPRESARIAL BLUE GARDENS","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"Carrera 53 No 100 50"},{"zona":"37","puesto_num":"01","nombre":"I.E SANTA MAGDALENA SOFIA","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CLL 84B No 76 -17"},{"zona":"37","puesto_num":"03","nombre":"C.E.D.LIBERTADOR SIMON BOLIVAR","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CL 106 KR 85"},{"zona":"37","puesto_num":"04","nombre":"INSTITUTO LAS AMERICAS","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"Cl. 85 No 78D 45"},{"zona":"38","puesto_num":"03","nombre":"COL.LA ENSEÑANZA","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CL 86 #52-119"},{"zona":"38","puesto_num":"04","nombre":"CENTRO COMERCIAL VIVA BARRANQUILLA","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"Carrera 51B No 87 50"},{"zona":"38","puesto_num":"05","nombre":"COLEGIO MARYMOUNT","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CRA 59 No 84-226"},{"zona":"99","puesto_num":"11","nombre":"IED SAN VICENTE DE PAUL","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CRA10 # 5-136"},{"zona":"99","puesto_num":"25","nombre":"I.E. DISTRITAL JUAN MINA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 7 No 7 - 27"},{"zona":"—","puesto_num":"—","nombre":"COLEGIO COLON","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Barranquilla"}];

    function normTxt(s) {
      return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    function localidadOficialDePuesto(nombrePuesto) {
      if (!nombrePuesto) return '';
      var q = normTxt(nombrePuesto);
      // alias
      if (q.indexOf('colon') >= 0 || q.indexOf('colón') >= 0) return 'Norte-Centro Histórico';
      var best = null, bestScore = 0;
      for (var i = 0; i < PUESTOS_OFICIALES_BAQ.length; i++) {
        var p = PUESTOS_OFICIALES_BAQ[i];
        var n = normTxt(p.nombre);
        if (!n) continue;
        if (n === q) return p.localidad || '';
        if (n.indexOf(q) >= 0 || q.indexOf(n) >= 0) {
          var sc = Math.min(n.length, q.length);
          if (sc > bestScore) { best = p; bestScore = sc; }
        }
      }
      return best ? (best.localidad || '') : '';
    }

    function metaPuestoOficial(nombrePuesto) {
      if (!nombrePuesto) return null;
      var q = normTxt(nombrePuesto);
      var best = null, bestScore = 0;
      for (var i = 0; i < PUESTOS_OFICIALES_BAQ.length; i++) {
        var p = PUESTOS_OFICIALES_BAQ[i];
        var n = normTxt(p.nombre);
        if (!n) continue;
        if (n === q) return p;
        if (n.indexOf(q) >= 0 || q.indexOf(n) >= 0) {
          var sc = Math.min(n.length, q.length);
          if (sc > bestScore) { best = p; bestScore = sc; }
        }
      }
      if (q.indexOf('colon') >= 0) {
        return PUESTOS_OFICIALES_BAQ.find(function (x) { return normTxt(x.nombre).indexOf('colon') >= 0; }) || {
          nombre: 'COLEGIO COLON', localidad: 'Norte-Centro Histórico', direccion: 'Barranquilla'
        };
      }
      return best;
    }

    function resolverLocalidadPersona(item) {
      var fromPuesto = localidadOficialDePuesto(item.puestoVotacion || item.puesto || '');
      if (fromPuesto) return fromPuesto;
      return (item.localidad || '').trim();
    }


    function getErroresCedula() {
      try {
        const raw = localStorage.getItem(ERRORES_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    function esNegativo(item) {
      return String((item && item.estado) || '').trim().toLowerCase() === 'negativo';
    }

    function cuentaPuesto(item) {
      return !esNegativo(item);
    }

    function pushErrorCedula(registro) {
      const lista = getErroresCedula();
      const ced = String((registro && registro.cedula) || '');
      const mot = String((registro && registro.motivo) || '');
      const ya = lista.some(function (e) {
        return String(e.cedula || '') === ced && String(e.motivo || '') === mot;
      });
      if (!ya) lista.unshift(Object.assign({ fecha: new Date().toISOString() }, registro));
      try { localStorage.setItem(ERRORES_KEY, JSON.stringify(lista.slice(0, 200))); } catch (e) {}
      // También pintar en módulo Errores si existe
      const listaEl = document.getElementById('lista-errores');
      if (listaEl) {
        const div = document.createElement('div');
        div.className = 'flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-lg mb-2';
        div.innerHTML = '<i class="fas fa-exclamation-circle text-rose-500 mt-1"></i><div><p class="text-sm font-medium text-rose-800">Cédula duplicada: ' + (registro.cedula || '') + '</p><p class="text-xs text-rose-600">' + (registro.nombre || '') + ' · ' + (registro.motivo || 'Ya existe en la estructura') + '</p></div>';
        listaEl.prepend(div);
      }
    }

    function todasLasCedulas() {
      const set = new Set();
      data.coordinadores.forEach(c => {
        if (c.cedula) set.add(String(c.cedula));
        (c.lideres || []).forEach(l => {
          if (l.cedula) set.add(String(l.cedula));
          (l.amigos || []).forEach(a => { if (a.cedula) set.add(String(a.cedula)); });
        });
      });
      return set;
    }

    function catalogoBarrios() {
      const seen = {};
      const out = [];
      Object.keys(BARRIOS_POR_LOCALIDAD).forEach(function (loc) {
        (BARRIOS_POR_LOCALIDAD[loc] || []).forEach(function (b) {
          const key = String(b).toLowerCase();
          if (!seen[key]) seen[key] = [];
          seen[key].push(loc);
          out.push({ barrio: b, localidad: loc });
        });
      });
      return { lista: out, porNombre: seen };
    }

    function llenarSelectBarrios(_localidad, barrioActual) {
      const list = document.getElementById('est-barrio-list');
      const inp = document.getElementById('est-barrio');
      if (list) {
        const cat = catalogoBarrios();
        const nombres = [];
        const used = {};
        cat.lista.forEach(function (it) {
          const k = it.barrio.toLowerCase();
          if (used[k]) return;
          used[k] = true;
          const locs = cat.porNombre[k] || [it.localidad];
          if (locs.length > 1) {
            locs.forEach(function (loc) {
              nombres.push('<option value="' + it.barrio + ' · ' + loc + '"></option>');
            });
          } else {
            nombres.push('<option value="' + it.barrio + '"></option>');
          }
        });
        list.innerHTML = nombres.join('');
      }
      if (inp && barrioActual) inp.value = barrioActual;
    }

    function localidadDeBarrio(nombre) {
      const raw = String(nombre || '').trim();
      if (!raw) return '';
      if (raw.indexOf(' · ') >= 0) return raw.split(' · ').slice(1).join(' · ').trim();
      const key = raw.toLowerCase();
      const locs = [];
      Object.keys(BARRIOS_POR_LOCALIDAD).forEach(function (loc) {
        (BARRIOS_POR_LOCALIDAD[loc] || []).forEach(function (b) {
          if (b.toLowerCase() === key && locs.indexOf(loc) === -1) locs.push(loc);
        });
      });
      return locs.length === 1 ? locs[0] : '';
    }

    function onLocalidadChange() {}

    function onBarrioChange() {
      const inp = document.getElementById('est-barrio');
      const locSel = document.getElementById('est-localidad');
      if (!inp || !locSel) return;
      const loc = localidadDeBarrio(inp.value);
      if (loc) locSel.value = loc;
    }

    function getBarrioSeleccionado() {
      const inp = document.getElementById('est-barrio');
      let v = ((inp && inp.value) || '').trim();
      if (v.indexOf(' · ') >= 0) v = v.split(' · ')[0].trim();
      const otro = document.getElementById('est-barrio-otro');
      if (!v && otro) v = (otro.value || '').trim();
      return v;
    }


    function uid(prefix) {
      return (prefix || 'ID') + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    function getSupabase() {
      if (global.SupabaseConfig && global.SupabaseConfig.client) {
        return global.SupabaseConfig.client;
      }
      return null;
    }

    function loadFromLocal() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        data = raw ? JSON.parse(raw) : { coordinadores: [] };
        if (!data.coordinadores) data.coordinadores = [];
      } catch (e) {
        console.warn('[Estructura] Error leyendo LocalStorage:', e);
        data = { coordinadores: [] };
      }
    }

    // Convierte fila de Supabase → objeto del módulo
    function mapRow(row) {
      if (!row) return null;
      return {
        id: row.id,
        cedula: row.cedula || '',
        nombre: row.nombre || '',
        barrio: row.barrio || '',
        localidad: row.localidad || '',
        direccion: row.direccion || '',
        telefono: row.telefono || '',
        puestoVotacion: row.puesto_votacion || row.puestoVotacion || '',
        mesa: row.mesa || '',
        foto: row.foto || null,
        estado: String(row.estado || '').trim().toLowerCase(),
        coordinadorId: row.coordinador_id || row.coordinadorId || null,
        liderId: row.lider_id || row.liderId || null,
        lideres: [],
        amigos: []
      };
    }

    // Convierte objeto del módulo → fila de Supabase
    function toRow(item, extra, incluirFoto) {
      const row = {
        id: item.id,
        cedula: item.cedula || null,
        nombre: item.nombre || null,
        barrio: item.barrio || null,
        localidad: item.localidad || null,
        direccion: item.direccion || null,
        telefono: item.telefono || null,
        puesto_votacion: item.puestoVotacion || item.puesto || null,
        mesa: item.mesa || null
      };
      // Solo coordinadores y líderes tienen columna foto
      if (incluirFoto !== false) {
        row.foto = item.foto || null;
      }
      if (extra) Object.assign(row, extra);
      return row;
    }

    async function load() {
      const supabase = getSupabase();

      if (!supabase) {
        loadFromLocal();
        render();
        updateInicioCount();
        return;
      }

      try {
        var resCoord = { data: [], error: null };
        var resLider = { data: [], error: null };
        var resAmigo = { data: [], error: null };
        var packOk = false;
        try {
          var one = await fetch('/api/estructura', { credentials: 'include' });
          if (one.ok) {
            var pack = await one.json();
            if (pack && pack.ok) {
              resCoord.data = pack.coordinadores || [];
              resLider.data = pack.lideres || [];
              resAmigo.data = pack.amigos || [];
              packOk = true;
            }
          }
        } catch (e0) {}
        if (!packOk) {
          const pair = await Promise.all([
            supabase.from('coordinadores').select('*'),
            supabase.from('lideres').select('*')
          ]);
          resCoord = pair[0];
          resLider = pair[1];
          resAmigo = await supabase.from('AMIGOS').select('*');
          if (resAmigo.error) resAmigo = await supabase.from('amigos').select('*');
        }

        if (resCoord.error) throw resCoord.error;
        if (resLider.error) throw resLider.error;
        if (resAmigo.error) throw resAmigo.error;

        const coords = (resCoord.data || []).map(mapRow);
        const lideres = (resLider.data || []).map(mapRow);
        const amigos = (resAmigo.data || []).map(mapRow);

        // 2. Armar el árbol Coordinador → Líder → Amigo
        coords.forEach(c => {
          c.lideres = lideres
            .filter(l => l.coordinadorId === c.id)
            .map(l => {
              l.amigos = amigos.filter(a => a.liderId === l.id);
              return l;
            });
        });

        if (!coords.length) {
          loadFromLocal();
          if ((data.coordinadores || []).length) {
            console.warn('[Estructura] API vacía, se muestra respaldo local');
            sincronizarNegativosAErrores();
            render();
            updateInicioCount();
            renderErrores();
            return;
          }
        }
        data = { coordinadores: coords };

        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}

        console.log('[Estructura] Cargado:', coords.length, 'coordinadores');
      } catch (err) {
        console.warn('[Estructura] Error de Supabase, usando LocalStorage:', err.message);
        loadFromLocal();
      }

      sincronizarNegativosAErrores();
      render();
      updateInicioCount();
      renderErrores();
    }

    function sincronizarNegativosAErrores() {
      (data.coordinadores || []).forEach(function (c) {
        (c.lideres || []).forEach(function (l) {
          if (esNegativo(l)) {
            pushErrorCedula({
              cedula: l.cedula,
              nombre: l.nombre,
              tipo: 'lider',
              barrio: l.barrio,
              motivo: 'Nombre no coincide con C.C'
            });
          }
          (l.amigos || []).forEach(function (a) {
            if (esNegativo(a)) {
              pushErrorCedula({
                cedula: a.cedula,
                nombre: a.nombre,
                tipo: 'amigo',
                barrio: a.barrio,
                motivo: 'Nombre no coincide con C.C'
              });
            }
          });
        });
      });
    }

    function renderErrores() {
      const listaEl = document.getElementById('lista-errores');
      if (!listaEl) return;
      const lista = getErroresCedula();
      if (!lista.length) {
        listaEl.innerHTML = '<p class="text-center text-slate-400 py-10 text-sm">Sin errores de cédula.</p>';
        return;
      }
      listaEl.innerHTML = lista.map(function (e) {
        const fecha = e.fecha ? new Date(e.fecha).toLocaleString('es-CO') : '';
        return '<div class="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-lg">' +
          '<i class="fas fa-exclamation-circle text-rose-500 mt-1"></i>' +
          '<div><p class="text-sm font-medium text-rose-800">' + (e.motivo || 'Error') +
          (e.cedula ? ' · CC ' + e.cedula : '') + '</p>' +
          '<p class="text-xs text-rose-600">' + (e.nombre || '') +
          (e.tipo ? ' · ' + e.tipo : '') +
          (e.barrio ? ' · ' + e.barrio : '') + '</p>' +
          '<p class="text-[11px] text-rose-400 mt-1">' + fecha + '</p></div></div>';
      }).join('');
    }

    async function upsertAmigos(supabase, amigosRows) {
      if (!amigosRows.length) return;
      // Intentar tabla AMIGOS y luego amigos
      var res = await supabase.from('AMIGOS').upsert(amigosRows, { onConflict: 'id' });
      if (res.error) {
        res = await supabase.from('amigos').upsert(amigosRows, { onConflict: 'id' });
      }
      if (res.error) throw res.error;
      console.log('[Estructura] ✅ amigos:', amigosRows.length);
    }

    async function deleteAmigoIds(supabase, ids) {
      if (!ids || !ids.length) return;
      var res = await supabase.from('AMIGOS').delete().in('id', ids);
      if (res.error) {
        res = await supabase.from('amigos').delete().in('id', ids);
      }
      if (res.error) console.error('[Estructura] Error borrando amigos:', res.error.message);
    }

    async function deleteFromSupabase(tipo, id, dependientes) {
      const supabase = getSupabase();
      if (!supabase) return;
      dependientes = dependientes || {};
      try {
        // Orden: amigos → líderes → coordinador
        if (dependientes.amigoIds && dependientes.amigoIds.length) {
          await deleteAmigoIds(supabase, dependientes.amigoIds);
        }
        if (dependientes.liderIds && dependientes.liderIds.length) {
          var rL = await supabase.from('lideres').delete().in('id', dependientes.liderIds);
          if (rL.error) console.error('[Estructura] Error borrando líderes:', rL.error.message);
        }
        if (tipo === 'amigo') {
          await deleteAmigoIds(supabase, [id]);
        } else if (tipo === 'lider') {
          var r1 = await supabase.from('lideres').delete().eq('id', id);
          if (r1.error) throw r1.error;
        } else if (tipo === 'coordinador') {
          var r2 = await supabase.from('coordinadores').delete().eq('id', id);
          if (r2.error) throw r2.error;
        }
        console.log('[Estructura] ✅ Eliminado en Supabase:', tipo, id);
      } catch (err) {
        console.error('[Estructura] Error eliminando en Supabase:', err.message || err);
        alert('Se eliminó en el panel, pero falló en la base de datos: ' + (err.message || err));
      }
    }

    async function saveToSupabase() {
      const supabase = getSupabase();
      if (!supabase) {
        console.warn('[Estructura] Supabase no disponible — solo LocalStorage');
        return { ok: false, reason: 'no-client' };
      }

      try {
        const coordsRows = [];
        const lideresRows = [];
        const amigosRows = [];

        data.coordinadores.forEach(c => {
          coordsRows.push(toRow(c, null, true));
          (c.lideres || []).forEach(l => {
            lideresRows.push(toRow(l, { coordinador_id: c.id }, true));
            (l.amigos || []).forEach(a => {
              amigosRows.push(toRow(a, { lider_id: l.id }, false));
            });
          });
        });

        if (coordsRows.length) {
          const { error } = await supabase.from('coordinadores').upsert(coordsRows, { onConflict: 'id' });
          if (error) {
            console.error('[Estructura] Error coordinadores:', error.message, error);
            throw error;
          }
          console.log('[Estructura] ✅ coordinadores:', coordsRows.length);
        }

        if (lideresRows.length) {
          const { error } = await supabase.from('lideres').upsert(lideresRows, { onConflict: 'id' });
          if (error) {
            console.error('[Estructura] Error lideres:', error.message, error);
            throw error;
          }
          console.log('[Estructura] ✅ lideres:', lideresRows.length);
        }

        await upsertAmigos(supabase, amigosRows);

        console.log('[Estructura] ✅ Guardado completo en Supabase');
        return { ok: true };
      } catch (err) {
        console.error('[Estructura] Error guardando en Supabase:', err.message || err);
        alert('No se pudo guardar en la base de datos: ' + (err.message || err) + '\n\nRevisa RLS/políticas en Supabase (INSERT/UPDATE/DELETE para usuarios autenticados).');
        return { ok: false, error: err };
      }
    }

    function save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('[Estructura] Error guardando LocalStorage:', e);
      }
      // Supabase en segundo plano
      return saveToSupabase();
    }

    function updateInicioCount() {
      const el = document.getElementById('inicio-total-estructura');
      if (!el) return;
      let total = 0;
      data.coordinadores.forEach(c => {
        total += 1;
        (c.lideres || []).forEach(l => {
          total += 1 + (l.amigos || []).length;
        });
      });
      el.textContent = total;
    }

    function findCoordinador(id) {
      return data.coordinadores.find(c => c.id === id);
    }

    function findLider(id) {
      for (const c of data.coordinadores) {
        const l = (c.lideres || []).find(x => x.id === id);
        if (l) return { lider: l, coordinador: c };
      }
      return null;
    }

    function openForm(tipo, editItem, parentId) {
      const form = document.getElementById('form-estructura');
      const titulo = document.getElementById('form-estructura-titulo');
      const tipoEl = document.getElementById('est-tipo');
      const editId = document.getElementById('est-edit-id');
      const parentWrap = document.getElementById('est-parent-wrap');
      const parentLabel = document.getElementById('est-parent-label');
      const parentSel = document.getElementById('est-parent');

      if (!form) return;

      tipoEl.value = tipo;
      editId.value = editItem ? editItem.id : '';

      document.getElementById('est-cedula').value = editItem ? (editItem.cedula || '') : '';
      document.getElementById('est-nombre').value = editItem ? capitalizarNombre(editItem.nombre || '') : '';
      // Localidad + Barrio
      const locEl = document.getElementById('est-localidad');
      const barrioVal = editItem ? (editItem.barrio || '') : '';
      llenarSelectBarrios('', barrioVal);
      const locAuto = localidadDeBarrio(barrioVal);
      const locVal = editItem ? (editItem.localidad || locAuto || '') : (locAuto || '');
      if (locEl) locEl.value = locVal;
      document.getElementById('est-direccion').value = editItem ? (editItem.direccion || '') : '';
      document.getElementById('est-telefono').value = editItem ? (editItem.telefono || '') : '';
      const puestoEl = document.getElementById('est-puesto');
      if (puestoEl) puestoEl.value = editItem ? (editItem.puestoVotacion || editItem.puesto || '') : '';
      const mesaEl = document.getElementById('est-mesa');
      if (mesaEl) mesaEl.value = editItem ? (editItem.mesa || '') : '';

      const fotoWrap = document.getElementById('est-foto-wrap');
      const fotoInput = document.getElementById('est-foto');
      const fotoPreview = document.getElementById('est-foto-preview');
      if (fotoInput) fotoInput.value = '';
      if (fotoPreview) {
        if (editItem && editItem.foto) {
          fotoPreview.src = editItem.foto;
          fotoPreview.classList.remove('hidden');
        } else {
          fotoPreview.src = '';
          fotoPreview.classList.add('hidden');
        }
      }

      if (tipo === 'coordinador') {
        titulo.textContent = editItem ? 'Editar Coordinador' : 'Nuevo Coordinador';
        parentWrap.classList.add('hidden');
        if (fotoWrap) fotoWrap.classList.remove('hidden');
      } else if (tipo === 'lider') {
        titulo.textContent = editItem ? 'Editar Líder' : 'Nuevo Líder';
        parentWrap.classList.remove('hidden');
        if (fotoWrap) fotoWrap.classList.remove('hidden');
        parentLabel.textContent = 'Coordinador al que pertenece *';
        parentSel.innerHTML = '<option value="">— Seleccionar coordinador —</option>';
        data.coordinadores.forEach(c => {
          parentSel.innerHTML += `<option value="${c.id}" ${((editItem && editItem.coordinadorId === c.id) || parentId === c.id) ? 'selected' : ''}>${c.nombre} (${c.cedula})</option>`;
        });
      } else if (tipo === 'amigo') {
        titulo.textContent = editItem ? 'Editar Amigo' : 'Nuevo Amigo';
        parentWrap.classList.remove('hidden');
        if (fotoWrap) fotoWrap.classList.add('hidden');
        parentLabel.textContent = 'Líder al que pertenece *';
        parentSel.innerHTML = '<option value="">— Seleccionar líder —</option>';
        data.coordinadores.forEach(c => {
          (c.lideres || []).forEach(l => {
            parentSel.innerHTML += `<option value="${l.id}" ${((editItem && editItem.liderId === l.id) || parentId === l.id) ? 'selected' : ''}>${l.nombre} — Coord: ${c.nombre}</option>`;
          });
        });
      }

      form.classList.remove('hidden');
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function closeForm() {
      const form = document.getElementById('form-estructura');
      if (form) form.classList.add('hidden');
    }

    async function leerFotoInput() {
      const fileInput = document.getElementById('est-foto');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) return null;
      const file = fileInput.files[0];
      if (file.size > 1.2 * 1024 * 1024) {
        alert('La foto supera 1.2 MB. Elige una imagen más liviana.');
        return undefined; // señal de error
      }
      try {
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (e) {
        alert('No se pudo leer la foto');
        return undefined;
      }
    }

    async function guardar() {
      const tipo = document.getElementById('est-tipo').value;
      const editId = document.getElementById('est-edit-id').value;
      // Cédula: solo números
      const cedula = String(document.getElementById('est-cedula').value || '').replace(/\D/g, '');
      const nombre = capitalizarNombre((document.getElementById('est-nombre').value || '').trim());
      const localidad = ((document.getElementById('est-localidad') || {}).value || '').trim();
      const barrio = getBarrioSeleccionado();
      const direccion = (document.getElementById('est-direccion').value || '').trim();
      const telefono = (document.getElementById('est-telefono').value || '').trim();
      const puestoVotacion = ((document.getElementById('est-puesto') || {}).value || '').trim();
      const mesa = String((document.getElementById('est-mesa') || {}).value || '').replace(/\D/g, '');
      const parentId = (document.getElementById('est-parent').value || '').trim();

      if (!cedula || !nombre) {
        alert('Cédula (solo números) y Nombre son obligatorios');
        return;
      }
      if (!/^\d+$/.test(cedula)) {
        alert('La cédula debe contener solo números');
        return;
      }
      if (!barrio) {
        alert('El barrio es obligatorio');
        return;
      }

      // Cédula duplicada → Errores (salvo si estamos editando el mismo registro)
      const cedulasExistentes = todasLasCedulas();
      let cedulaDelEdit = null;
      if (editId) {
        if (tipo === 'coordinador') {
          const c = findCoordinador(editId);
          if (c) cedulaDelEdit = String(c.cedula || '');
        } else if (tipo === 'lider') {
          const f = findLider(editId);
          if (f && f.lider) cedulaDelEdit = String(f.lider.cedula || '');
        } else {
          data.coordinadores.forEach(c => {
            (c.lideres || []).forEach(l => {
              const a = (l.amigos || []).find(x => x.id === editId);
              if (a) cedulaDelEdit = String(a.cedula || '');
            });
          });
        }
      }
      if (cedulasExistentes.has(cedula) && cedula !== cedulaDelEdit) {
        pushErrorCedula({
          cedula: cedula,
          nombre: nombre,
          tipo: tipo,
          barrio: barrio,
          localidad: localidad,
          motivo: 'Cédula ya registrada en la estructura'
        });
        alert('Cédula duplicada. El registro se envió a Errores y NO se guardó.');
        return;
      }

      // Foto solo para coordinador y líder
      let fotoNueva = null;
      if (tipo === 'coordinador' || tipo === 'lider') {
        const leida = await leerFotoInput();
        if (leida === undefined) return; // error de tamaño/lectura
        fotoNueva = leida; // null = no cambió; string = nueva foto
      }

      if (tipo === 'coordinador') {
        if (editId) {
          const c = findCoordinador(editId);
          if (c) {
            c.cedula = cedula;
            c.nombre = nombre;
            c.localidad = localidad;
            c.barrio = barrio;
            c.direccion = direccion;
            c.telefono = telefono;
            c.puestoVotacion = puestoVotacion;
            c.mesa = mesa;
            if (fotoNueva) c.foto = fotoNueva;
          }
        } else {
          const nuevo = {
            id: uid('CO'), cedula, nombre, localidad, barrio, direccion, telefono,
            puestoVotacion, mesa, lideres: []
          };
          if (fotoNueva) nuevo.foto = fotoNueva;
          data.coordinadores.push(nuevo);
        }
      } else if (tipo === 'lider') {
        if (!parentId) {
          alert('Debes seleccionar el Coordinador al que pertenece');
          return;
        }
        const coord = findCoordinador(parentId);
        if (!coord) {
          alert('Coordinador no encontrado');
          return;
        }
        coord.lideres = coord.lideres || [];
        if (editId) {
          const prev = findLider(editId);
          const amigosPrev = (prev && prev.lider && prev.lider.amigos) ? prev.lider.amigos : [];
          const fotoPrev = (prev && prev.lider && prev.lider.foto) ? prev.lider.foto : null;
          data.coordinadores.forEach(c => {
            c.lideres = (c.lideres || []).filter(l => l.id !== editId);
          });
          const lider = {
            id: editId,
            cedula, nombre, localidad, barrio, direccion, telefono,
            puestoVotacion, mesa,
            coordinadorId: parentId,
            amigos: amigosPrev
          };
          if (fotoNueva) lider.foto = fotoNueva;
          else if (fotoPrev) lider.foto = fotoPrev;
          coord.lideres.push(lider);
        } else {
          const lider = {
            id: uid('LI'),
            cedula, nombre, localidad, barrio, direccion, telefono,
            puestoVotacion, mesa,
            coordinadorId: parentId,
            amigos: []
          };
          if (fotoNueva) lider.foto = fotoNueva;
          coord.lideres.push(lider);
        }
      } else if (tipo === 'amigo') {
        if (!parentId) {
          alert('Debes seleccionar el Líder al que pertenece');
          return;
        }
        const found = findLider(parentId);
        if (!found) {
          alert('Líder no encontrado');
          return;
        }
        found.lider.amigos = found.lider.amigos || [];
        if (editId) {
          data.coordinadores.forEach(c => {
            (c.lideres || []).forEach(l => {
              l.amigos = (l.amigos || []).filter(a => a.id !== editId);
            });
          });
          found.lider.amigos.push({
            id: editId,
            cedula, nombre, localidad, barrio, direccion, telefono,
            puestoVotacion, mesa,
            liderId: parentId
          });
        } else {
          found.lider.amigos.push({
            id: uid('AM'),
            cedula, nombre, localidad, barrio, direccion, telefono,
            puestoVotacion, mesa,
            liderId: parentId
          });
        }
      }

      save();
      closeForm();
      render();
    }

    function eliminar(tipo, id) {
      if (!confirm('¿Eliminar este registro? Se eliminarán también sus dependientes.')) return;

      var dep = { liderIds: [], amigoIds: [] };

      if (tipo === 'coordinador') {
        var coord = data.coordinadores.find(c => c.id === id);
        if (coord) {
          (coord.lideres || []).forEach(l => {
            dep.liderIds.push(l.id);
            (l.amigos || []).forEach(a => dep.amigoIds.push(a.id));
          });
        }
        data.coordinadores = data.coordinadores.filter(c => c.id !== id);
      } else if (tipo === 'lider') {
        data.coordinadores.forEach(c => {
          (c.lideres || []).forEach(l => {
            if (l.id === id) {
              (l.amigos || []).forEach(a => dep.amigoIds.push(a.id));
            }
          });
          c.lideres = (c.lideres || []).filter(l => l.id !== id);
        });
      } else if (tipo === 'amigo') {
        data.coordinadores.forEach(c => {
          (c.lideres || []).forEach(l => {
            l.amigos = (l.amigos || []).filter(a => a.id !== id);
          });
        });
      }

      // Local primero
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {}
      // Luego borrar en Supabase (si no se borra allá, al recargar vuelve)
      deleteFromSupabase(tipo, id, dep);
      render();
      updateInicioCount();
    }

    let subActual = 'coordinadores';
    let pageActual = { coordinadores: 1, lideres: 1, amigos: 1 };
    const PAGE_SIZE = 20;

    function norm(s) {
      return String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    }

    function estadoVisitaAmigo(amigoId) {
      var lista = [];
      try {
        if (global.App && global.App.instance && global.App.instance.seguimiento &&
            typeof global.App.instance.seguimiento.listar === 'function') {
          lista = global.App.instance.seguimiento.listar() || [];
        }
      } catch (e) {}
      if (!lista.length) {
        try {
          lista = JSON.parse(localStorage.getItem('seguimientos_rutas_v1') || '[]');
        } catch (e2) { lista = []; }
      }
      var mejor = null;
      lista.forEach(function (v) {
        if (!v || String(v.personaId) !== String(amigoId)) return;
        if (v.tipo === 'apertura_ruta') return;
        if (!mejor || Number(v.rutaNum || 0) > Number(mejor.rutaNum || 0)) mejor = v;
      });
      return (mejor && mejor.estado) || 'pendiente';
    }

    function getFiltros() {
      return {
        nombre: norm((document.getElementById('est-filtro-nombre') || {}).value),
        cedula: String((document.getElementById('est-filtro-cedula') || {}).value || '').replace(/\D/g, ''),
        barrio: norm((document.getElementById('est-filtro-barrio') || {}).value),
        lider: norm((document.getElementById('est-filtro-lider') || {}).value),
        coordinador: norm((document.getElementById('est-filtro-coordinador') || {}).value),
        puesto: norm((document.getElementById('est-filtro-puesto') || {}).value),
        visita: String((document.getElementById('est-filtro-visita') || {}).value || '').trim()
      };
    }

    function pasaFiltro(item, f) {
      if (!f) return true;
      if (f.nombre && norm(item.nombre).indexOf(f.nombre) < 0) return false;
      if (f.cedula && String(item.cedula || '').indexOf(f.cedula) < 0) return false;
      if (f.barrio && norm(item.barrio).indexOf(f.barrio) < 0) return false;
      var puesto = item.puestoVotacion || item.puesto || '';
      if (f.puesto && norm(puesto).indexOf(f.puesto) < 0) return false;
      // líder: en pestaña líderes = nombre propio; en amigos = _liderNombre
      if (f.lider) {
        var lidNom = item._liderNombre || (subActual === 'lideres' ? item.nombre : '');
        if (norm(lidNom).indexOf(f.lider) < 0) return false;
      }
      // coordinador: en líderes/amigos viene _coordNombre; en coordinadores = nombre
      if (f.coordinador) {
        var cNom = item._coordNombre || (subActual === 'coordinadores' ? item.nombre : '');
        if (norm(cNom).indexOf(f.coordinador) < 0) return false;
      }
      if (f.visita) {
        if (subActual !== 'amigos') return true;
        var estV = estadoVisitaAmigo(item.id);
        if (estV !== f.visita) return false;
      }
      return true;
    }

    function aplicarFiltrosUI() {
      pageActual[subActual] = 1;
      render();
    }

    function limpiarFiltros() {
      ['est-filtro-nombre','est-filtro-cedula','est-filtro-barrio','est-filtro-lider','est-filtro-coordinador','est-filtro-puesto','est-filtro-visita'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      pageActual[subActual] = 1;
      render();
    }

    function setSub(sub) {
      subActual = sub || 'coordinadores';
      document.querySelectorAll('.est-sub-btn').forEach(btn => {
        const active = btn.getAttribute('data-sub') === subActual;
        btn.classList.toggle('bg-indigo-50', active);
        btn.classList.toggle('text-indigo-700', active);
        btn.classList.toggle('text-slate-600', !active);
        btn.classList.toggle('hover:bg-slate-50', !active);
      });
      const txt = document.getElementById('btn-nuevo-estructura-texto');
      if (txt) {
        if (subActual === 'coordinadores') txt.textContent = 'Nuevo Coordinador';
        else if (subActual === 'lideres') txt.textContent = 'Nuevo Líder';
        else txt.textContent = 'Nuevo Amigo';
      }
      const btnNuevo = document.getElementById('btn-nuevo-estructura');
      if (btnNuevo) {
        btnNuevo.className = 'text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm ' +
          (subActual === 'coordinadores' ? 'bg-indigo-600 hover:bg-indigo-700' :
           subActual === 'lideres' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700');
      }
      closeForm();
      // no reset page on same sub switch unless new
      render();
    }

    function cardPersona(item, tipo, extraHtml) {
      const icon = tipo === 'coordinador' ? 'fa-user-tie' : (tipo === 'lider' ? 'fa-user-friends' : 'fa-user');
      const iconBox = tipo === 'coordinador'
        ? 'bg-indigo-50 text-indigo-600'
        : (tipo === 'lider' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600');
      const selKey = tipo + '|' + item.id;
      const checked = seleccionWa[selKey] ? 'checked' : '';
      const chk = `<label class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer" title="Seleccionar para masivo">
             <input type="checkbox" class="est-wa-chk rounded border-slate-300 text-emerald-600" data-tipo="${tipo}" data-id="${item.id}" ${checked}>
           </label>`;
      const btnSeg = `<button onclick="window.App.instance.estructura.abrirSeguimiento('${tipo}','${item.id}')" class="w-8 h-8 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 flex items-center justify-center transition" title="Seguimiento">
             <i class="fas fa-route text-sm"></i>
           </button>`;
      const btnWa = item.telefono
        ? `<button onclick="window.App.instance.estructura.abrirWhatsApp('${tipo}','${item.id}')" class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition" title="WhatsApp">
             <i class="fab fa-whatsapp text-sm"></i>
           </button>`
        : '';
      const btnInfo = `<button onclick="window.App.instance.estructura.verInfo('${tipo}','${item.id}')" class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center transition" title="Información">
             <i class="fas fa-info-circle text-sm"></i>
           </button>`;
      const avatar = (item.foto && (tipo === 'coordinador' || tipo === 'lider'))
        ? `<img src="${item.foto}" alt="${item.nombre}" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0">`
        : `<div class="w-12 h-12 rounded-xl ${iconBox} flex items-center justify-center shrink-0"><i class="fas ${icon}"></i></div>`;
      const estVis = tipo === 'amigo' ? estadoVisitaAmigo(item.id) : '';
      const esNoMil = tipo === 'amigo' && estVis === 'no_militante';
      const esNeg = ((tipo === 'lider' || tipo === 'amigo') && esNegativo(item)) || esNoMil;
      const alertaNeg = esNegativo(item)
        ? `<p class="text-xs font-semibold text-rose-600 mt-1">Nombre no coincide con C.C</p>`
        : '';
      const badgeVis = tipo === 'amigo'
        ? `<p class="text-[11px] mt-0.5 ${esNoMil ? 'text-rose-600 font-semibold' : 'text-slate-500'}">${
            estVis === 'realizado' ? 'Visitado' : estVis === 'no_asistio' ? 'No estaba' : estVis === 'no_militante' ? 'No militante' : 'Pendiente de visita'
          }</p>`
        : '';
      return `
        <div class="bg-white rounded-xl border ${esNeg ? 'border-rose-300 bg-rose-50' : 'border-slate-200'} shadow-sm p-4 flex flex-wrap justify-between items-start gap-3 hover:shadow-md transition-shadow">
          <div class="flex items-start gap-3 min-w-0">
            ${avatar}
            <div class="min-w-0">
              <p class="font-semibold ${esNeg ? 'text-rose-700' : 'text-slate-800'} truncate">${capitalizarNombre(item.nombre)}</p>
              <p class="text-xs ${esNeg ? 'text-rose-500' : 'text-slate-500'} mt-0.5">CC ${item.cedula}${item.telefono ? ' · ' + item.telefono : ''}</p>
              ${alertaNeg}
              ${badgeVis}
              ${item.barrio ? `<p class="text-[11px] text-slate-500 mt-0.5"><i class="fas fa-home mr-1"></i>${item.barrio}</p>` : ''}
              ${(item.puestoVotacion || item.mesa) ? `<p class="text-[11px] text-indigo-600 mt-0.5"><i class="fas fa-vote-yea mr-1"></i>${item.puestoVotacion || 'Puesto'}${item.mesa ? ' · Mesa ' + item.mesa : ''}</p>` : ''}
              ${item.direccion ? `<p class="text-[11px] text-slate-400 mt-0.5"><i class="fas fa-map-marker-alt mr-1"></i>${item.direccion}</p>` : ''}
              ${extraHtml || ''}
            </div>
          </div>
          <div class="flex gap-1.5 shrink-0">
            ${chk}
            ${btnInfo}
            ${btnSeg}
            ${btnWa}
            <button onclick="window.App.instance.estructura.editar('${tipo}','${item.id}')" class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center transition" title="Editar">
              <i class="fas fa-pen text-xs"></i>
            </button>
            <button onclick="window.App.instance.estructura.eliminar('${tipo}','${item.id}')" class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition" title="Eliminar">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>`;
    }

    function asegurarModalInfo() {
      if (document.getElementById('modal-info-estructura')) return;
      var div = document.createElement('div');
      div.id = 'modal-info-estructura';
      div.className = 'hidden fixed inset-0 z-[80] flex items-center justify-center p-4';
      div.innerHTML =
        '<div class="absolute inset-0 bg-slate-900/50" data-close="1"></div>' +
        '<div class="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">' +
        '<div class="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">' +
        '<h3 class="font-bold text-slate-800 text-base"><i class="fas fa-info-circle text-indigo-500 mr-2"></i>Información</h3>' +
        '<button type="button" id="btn-cerrar-info-estructura" class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500"><i class="fas fa-times"></i></button>' +
        '</div>' +
        '<div id="modal-info-estructura-body" class="p-5"></div>' +
        '</div>';
      document.body.appendChild(div);
      div.querySelector('[data-close]').onclick = function () { div.classList.add('hidden'); };
      document.getElementById('btn-cerrar-info-estructura').onclick = function () { div.classList.add('hidden'); };
    }

    function barrasHTML(items) {
      // items: [{label, value, color}]
      if (!items || !items.length) return '<p class="text-sm text-slate-400 text-center py-4">Sin datos para graficar</p>';
      var max = Math.max.apply(null, items.map(function (x) { return x.value; }).concat([1]));
      var html = '<div class="space-y-3 mt-2">';
      items.forEach(function (it) {
        var pct = Math.round((it.value / max) * 100);
        var col = it.color || 'bg-indigo-500';
        html += '<div>';
        html += '<div class="flex justify-between text-xs mb-1"><span class="font-medium text-slate-700 truncate max-w-[70%]">' + (it.label || '—') + '</span>';
        html += '<span class="font-bold text-slate-800">' + it.value + '</span></div>';
        html += '<div class="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ' + col + '" style="width:' + Math.max(it.value ? 6 : 0, pct) + '%"></div></div>';
        html += '</div>';
      });
      html += '</div>';
      return html;
    }

    function verInfo(tipo, id) {
      asegurarModalInfo();
      var body = document.getElementById('modal-info-estructura-body');
      var modal = document.getElementById('modal-info-estructura');
      if (!body || !modal) return;

      var html = '';
      var LOCALIDADES = ['Norte-Centro Histórico','Riomar','Metropolitana','Suroriente','Suroccidente'];

      function bloqueVoto(puesto, mesa, loc) {
        var meta = metaPuestoOficial(puesto);
        var locFinal = loc || (meta && meta.localidad) || localidadOficialDePuesto(puesto) || '—';
        var dir = (meta && meta.direccion) ? meta.direccion : '';
        var nombreOficial = (meta && meta.nombre) ? meta.nombre : (puesto || '—');
        var h = '<div class="bg-slate-50 rounded-xl p-3 mb-4 text-sm space-y-1.5">';
        h += '<p><span class="text-slate-500">Localidad (oficial):</span> <strong class="text-indigo-700">' + locFinal + '</strong></p>';
        h += '<p><span class="text-slate-500">Puesto:</span> <strong>' + nombreOficial + '</strong>' + (mesa ? ' · Mesa ' + mesa : '') + '</p>';
        if (dir) h += '<p><span class="text-slate-500">Dirección:</span> ' + dir + '</p>';
        h += '</div>';
        return h;
      }

      if (tipo === 'coordinador') {
        var c = findCoordinador(id);
        if (!c) return;
        var lideres = c.lideres || [];
        var nL = lideres.length;
        var nA = lideres.reduce(function (a, l) { return a + (l.amigos || []).length; }, 0);
        var puesto = c.puestoVotacion || c.puesto || '';
        var locC = resolverLocalidadPersona(c);

        // Personas de la red por localidad (oficial)
        var porLoc = {};
        LOCALIDADES.forEach(function (l) { porLoc[l] = 0; });
        lideres.forEach(function (l) {
          var locL = resolverLocalidadPersona(l) || locC;
          if (porLoc[locL] === undefined) porLoc[locL] = 0;
          porLoc[locL]++;
          (l.amigos || []).forEach(function (a) {
            var locA = resolverLocalidadPersona(a) || locL;
            if (porLoc[locA] === undefined) porLoc[locA] = 0;
            porLoc[locA]++;
          });
        });
        // puestos de la red
        var porPuesto = {};
        function addPuesto(p, n) {
          var key = (p || 'Sin puesto').trim() || 'Sin puesto';
          var meta = metaPuestoOficial(key);
          var label = meta ? meta.nombre : key;
          porPuesto[label] = (porPuesto[label] || 0) + n;
        }
        if (puesto && cuentaPuesto(c)) addPuesto(puesto, 1);
        lideres.forEach(function (l) {
          if (cuentaPuesto(l)) addPuesto(l.puestoVotacion || l.puesto || 'Sin puesto', 1);
          (l.amigos || []).forEach(function (a) {
            if (cuentaPuesto(a)) addPuesto(a.puestoVotacion || a.puesto || l.puestoVotacion || 'Sin puesto', 1);
          });
        });

        var chartLideres = lideres.map(function (l) {
          return { label: l.nombre || 'Líder', value: (l.amigos || []).length, color: 'bg-blue-500' };
        });
        var chartLoc = LOCALIDADES.map(function (l) {
          return { label: l, value: porLoc[l] || 0, color: 'bg-indigo-500' };
        }).filter(function (x) { return x.value > 0; }).sort(function (a,b){return b.value-a.value;});
        var chartPuesto = Object.keys(porPuesto).map(function (k) {
          return { label: k, value: porPuesto[k], color: 'bg-emerald-500' };
        }).sort(function (a,b){return b.value-a.value;});

        html += '<div class="mb-4"><p class="text-lg font-bold text-slate-800">' + (c.nombre||'') + '</p>';
        html += '<p class="text-xs text-slate-500">Coordinador · CC ' + (c.cedula||'') + (c.telefono ? ' · ' + c.telefono : '') + '</p></div>';
        html += '<div class="grid grid-cols-2 gap-2 mb-4">';
        html += '<div class="bg-indigo-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-indigo-700">' + nL + '</p><p class="text-[11px] text-indigo-600">Líderes</p></div>';
        html += '<div class="bg-emerald-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-emerald-700">' + nA + '</p><p class="text-[11px] text-emerald-600">Amigos</p></div></div>';
        html += bloqueVoto(puesto, c.mesa, locC);
        html += '<p class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Red por localidad</p>' + barrasHTML(chartLoc);
        html += '<p class="text-xs font-bold uppercase tracking-wide text-slate-500 mt-5 mb-1">Amigos por líder</p>' + barrasHTML(chartLideres);
        html += '<p class="text-xs font-bold uppercase tracking-wide text-slate-500 mt-5 mb-1">Personas por puesto de votación</p>' + barrasHTML(chartPuesto);

      } else if (tipo === 'lider') {
        var found = findLider(id);
        if (!found) return;
        var l = found.lider, coord = found.coordinador;
        var amigos = l.amigos || [];
        var puesto = l.puestoVotacion || l.puesto || '';
        var locL = resolverLocalidadPersona(l);

        var porLoc = {};
        LOCALIDADES.forEach(function (x) { porLoc[x] = 0; });
        amigos.forEach(function (a) {
          var locA = resolverLocalidadPersona(a) || locL;
          if (porLoc[locA] === undefined) porLoc[locA] = 0;
          porLoc[locA]++;
        });
        var porPuesto = {};
        function addP(p) {
          var key = (p || 'Sin puesto').trim() || 'Sin puesto';
          var meta = metaPuestoOficial(key);
          var label = meta ? meta.nombre : key;
          porPuesto[label] = (porPuesto[label] || 0) + 1;
        }
        if (cuentaPuesto(l)) addP(puesto);
        amigos.forEach(function (a) {
          if (cuentaPuesto(a)) addP(a.puestoVotacion || a.puesto || puesto);
        });

        var chartLoc = LOCALIDADES.map(function (x) {
          return { label: x, value: porLoc[x] || 0, color: 'bg-indigo-500' };
        }).filter(function (x) { return x.value > 0; });
        var chartPuesto = Object.keys(porPuesto).map(function (k) {
          return { label: k, value: porPuesto[k], color: 'bg-blue-500' };
        }).sort(function (a,b){return b.value-a.value;});

        html += '<div class="mb-4"><p class="text-lg font-bold text-slate-800">' + (l.nombre||'') + '</p>';
        html += '<p class="text-xs text-slate-500">Líder · CC ' + (l.cedula||'') + (l.telefono ? ' · ' + l.telefono : '') + '</p></div>';
        html += '<div class="grid grid-cols-2 gap-2 mb-4">';
        html += '<div class="bg-blue-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-blue-700">' + amigos.length + '</p><p class="text-[11px] text-blue-600">Amigos</p></div>';
        html += '<div class="bg-indigo-50 rounded-xl p-3 text-center"><p class="text-sm font-bold text-indigo-700 truncate">' + ((coord && coord.nombre) || '—') + '</p><p class="text-[11px] text-indigo-600">Coordinador</p></div></div>';
        html += bloqueVoto(puesto, l.mesa, locL);
        html += '<p class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Amigos por localidad</p>' + barrasHTML(chartLoc);
        html += '<p class="text-xs font-bold uppercase tracking-wide text-slate-500 mt-5 mb-1">Puestos de votación</p>' + barrasHTML(chartPuesto);

      } else if (tipo === 'amigo') {
        var am = null, lid = null, co = null;
        data.coordinadores.forEach(function (c) {
          (c.lideres || []).forEach(function (l) {
            (l.amigos || []).forEach(function (a) {
              if (a.id === id) { am = a; lid = l; co = c; }
            });
          });
        });
        if (!am) return;
        var puesto = am.puestoVotacion || am.puesto || '';
        var locA = resolverLocalidadPersona(am);
        html += '<div class="mb-4"><p class="text-lg font-bold text-slate-800">' + (am.nombre||'') + '</p>';
        html += '<p class="text-xs text-slate-500">Amigo · CC ' + (am.cedula||'') + (am.telefono ? ' · ' + am.telefono : '') + '</p></div>';
        html += bloqueVoto(puesto, am.mesa, locA);
        html += '<div class="bg-white border border-slate-100 rounded-xl p-3 text-sm space-y-1 mb-3">';
        html += '<p><span class="text-slate-500">Barrio:</span> <strong>' + (am.barrio || '—') + '</strong></p>';
        html += '<p><span class="text-slate-500">Líder:</span> <strong>' + (lid ? lid.nombre : '—') + '</strong></p>';
        html += '<p><span class="text-slate-500">Coordinador:</span> <strong>' + (co ? co.nombre : '—') + '</strong></p></div>';
        // puestos oficiales de su localidad para contexto
        var locShow = locA || 'Norte-Centro Histórico';
        var delLoc = PUESTOS_OFICIALES_BAQ.filter(function (p) { return p.localidad === locShow; });
        html += '<p class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Puestos oficiales en ' + locShow + ' (' + delLoc.length + ')</p>';
        html += '<div class="max-h-40 overflow-y-auto text-[11px] text-slate-600 space-y-1 border border-slate-100 rounded-xl p-3">';
        delLoc.slice(0, 40).forEach(function (p) {
          var mark = normTxt(p.nombre) === normTxt(puesto) || (puesto && normTxt(p.nombre).indexOf(normTxt(puesto)) >= 0);
          html += '<p class="' + (mark ? 'font-bold text-indigo-700' : '') + '">' + p.nombre + (p.direccion ? ' · ' + p.direccion : '') + '</p>';
        });
        html += '</div>';
      }

      body.innerHTML = html;
      modal.classList.remove('hidden');
    }


    // ==================== MÓDULO WHATSAPP (portado del Organizador) ====================
    let waContext = { telefono: '', nombre: '', barrio: '', tipo: '', id: '', destinos: [] };
    const seleccionWa = {};

    function claveSel(tipo, id) { return String(tipo || '') + '|' + String(id || ''); }

    function toggleSelWa(tipo, id, checked) {
      const k = claveSel(tipo, id);
      if (checked) seleccionWa[k] = true;
      else delete seleccionWa[k];
      actualizarBarraMasivo();
    }

    function personaPorClave(k) {
      const parts = String(k || '').split('|');
      const tipo = parts[0];
      const id = parts[1];
      if (tipo === 'coordinador') return findCoordinador(id);
      if (tipo === 'lider') {
        const f = findLider(id);
        return f ? f.lider : null;
      }
      if (tipo === 'amigo') {
        for (const c of data.coordinadores) {
          for (const l of (c.lideres || [])) {
            const a = (l.amigos || []).find(x => x.id === id);
            if (a) return a;
          }
        }
      }
      return null;
    }

    function destinosSeleccionados() {
      const tels = [];
      Object.keys(seleccionWa).forEach(function (k) {
        const p = personaPorClave(k);
        const tel = normalizarTelefonoCO(p && p.telefono);
        if (tel && tel.length >= 12 && tels.indexOf(tel) === -1) tels.push(tel);
      });
      return tels;
    }

    function actualizarBarraMasivo() {
      const n = Object.keys(seleccionWa).length;
      const bar = document.getElementById('est-wa-masivo');
      const cnt = document.getElementById('est-wa-masivo-n');
      if (cnt) cnt.textContent = String(n);
      if (bar) bar.classList.toggle('hidden', n === 0);
    }

    function abrirWhatsAppMasivo() {
      const destinos = destinosSeleccionados();
      if (!destinos.length) return;
      ensureModalWhatsApp();
      waContext = {
        telefono: destinos[0],
        nombre: 'grupo',
        barrio: '',
        tipo: 'masivo',
        id: '',
        destinos: destinos
      };
      document.getElementById('wa-est-nombre').textContent = destinos.length + ' destinatarios seleccionados';
      document.getElementById('wa-est-telefono-display').textContent = destinos.join(', ');
      const inp = document.getElementById('wa-est-telefono-input');
      if (inp) inp.value = destinos.join(', ');
      const lab = document.getElementById('wa-est-destino-label');
      if (lab) lab.textContent = 'Envío masivo a cola Supabase (sin pedir permiso)';
      usarPlantilla('actividad');
      document.getElementById('modal-whatsapp-estructura').classList.remove('hidden');
    }

    function normalizarTelefonoCO(tel) {
      // Formato obligatorio: 57 + número pegado (ej: 573002932365)
      let digitos = String(tel || '').replace(/\D/g, '');
      if (!digitos) return '';
      if (digitos.startsWith('0')) digitos = digitos.replace(/^0+/, '');
      if (digitos.startsWith('57') && digitos.length >= 12) return digitos;
      if (digitos.length === 10) return '57' + digitos;
      if (!digitos.startsWith('57')) return '57' + digitos;
      return digitos;
    }

    function esComputador() {
      const ua = navigator.userAgent || '';
      const movil = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
      return !movil || window.innerWidth >= 900;
    }

    function urlWhatsApp(tel, mensaje, forzarWeb) {
      const text = mensaje ? encodeURIComponent(mensaje) : '';
      const usarWeb = forzarWeb === true || (forzarWeb !== false && esComputador());
      if (usarWeb) {
        return 'https://web.whatsapp.com/send?phone=' + tel + (text ? '&text=' + text : '');
      }
      return 'https://wa.me/' + tel + (text ? '?text=' + text : '');
    }

    function ensureModalWhatsApp() {
      if (document.getElementById('modal-whatsapp-estructura')) return;
      const modal = document.createElement('div');
      modal.id = 'modal-whatsapp-estructura';
      modal.className = 'fixed inset-0 bg-black/50 z-[200] hidden flex items-center justify-center p-4';
      modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="sticky top-0 bg-emerald-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h3 class="text-lg font-semibold flex items-center gap-2"><i class="fab fa-whatsapp"></i> WhatsApp</h3>
            <button type="button" id="wa-est-cerrar" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
          </div>
          <div class="p-6 space-y-4">
            <div class="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-900">
              <strong>Número:</strong> se envía como <code>57</code> + dígitos pegados (ej: <code>573002932365</code>).
              En PC se abre WhatsApp Web; en celular, la app.
            </div>
            <div class="bg-slate-50 rounded-lg p-3 text-sm space-y-2">
              <div class="font-semibold" id="wa-est-nombre">—</div>
              <div class="text-slate-500 font-mono text-sm" id="wa-est-telefono-display">—</div>
              <div class="text-[11px] text-slate-400" id="wa-est-destino-label">Destino: WhatsApp Web / App</div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Teléfono destino (editable)</label>
                <input type="tel" id="wa-est-telefono-input" inputmode="numeric" placeholder="Ej: 573002932365"
                  class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">O elegir de la estructura</label>
                <select id="wa-est-contacto-select" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">— Seleccionar coordinador / líder / amigo —</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Plantilla de mensaje</label>
              <div class="grid grid-cols-2 gap-2" id="wa-est-plantillas">
                <button type="button" data-plantilla="actividad" class="text-left text-sm border rounded-lg px-3 py-2 hover:bg-emerald-50 hover:border-emerald-300">📸 Actividades</button>
                <button type="button" data-plantilla="ayuda" class="text-left text-sm border rounded-lg px-3 py-2 hover:bg-emerald-50 hover:border-emerald-300">🤝 Cómo ayudar</button>
                <button type="button" data-plantilla="invitacion" class="text-left text-sm border rounded-lg px-3 py-2 hover:bg-emerald-50 hover:border-emerald-300">📅 Invitación</button>
                <button type="button" data-plantilla="cumpleanos" class="text-left text-sm border rounded-lg px-3 py-2 hover:bg-pink-50 hover:border-pink-300">🎂 Cumpleaños</button>
                <button type="button" data-plantilla="seguimiento" class="text-left text-sm border rounded-lg px-3 py-2 hover:bg-emerald-50 hover:border-emerald-300">👋 Seguimiento</button>
                <button type="button" data-plantilla="personalizado" class="text-left text-sm border rounded-lg px-3 py-2 hover:bg-slate-50">✏️ Personalizado</button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Mensaje</label>
              <textarea id="wa-est-mensaje" rows="6" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" placeholder="Escribe o elige una plantilla..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Foto / anexos (Storage + cola Supabase)</label>
              <input type="file" id="wa-est-anexos" accept="image/*,.pdf" multiple
                class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700">
              <p class="text-[11px] text-slate-400 mt-1">Se guarda en whatsapp_messages (pendiente) con imagen_path.</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <button type="button" id="wa-est-cancelar" class="flex-1 border rounded-lg py-2.5 text-sm hover:bg-slate-50">Cancelar</button>
              <button type="button" id="wa-est-enviar-app" class="flex-1 border border-emerald-600 text-emerald-700 rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-50">
                <i class="fab fa-whatsapp mr-1"></i> App / wa.me
              </button>
              <button type="button" id="wa-est-enviar-web" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-medium">
                <i class="fas fa-desktop mr-1"></i> WhatsApp Web
              </button>
            </div>
            <button type="button" id="wa-est-enviar-directo" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium">
              <i class="fas fa-paper-plane mr-1"></i> Enviar directo (abrir ya)
            </button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModalWhatsApp(); });
      modal.querySelector('#wa-est-cerrar').onclick = cerrarModalWhatsApp;
      modal.querySelector('#wa-est-cancelar').onclick = cerrarModalWhatsApp;
      modal.querySelector('#wa-est-enviar-app').onclick = () => enviarWhatsApp(false);
      modal.querySelector('#wa-est-enviar-web').onclick = () => enviarWhatsApp(true);
      modal.querySelector('#wa-est-enviar-directo').onclick = () => enviarWhatsApp(esComputador());
      modal.querySelector('#wa-est-telefono-input').addEventListener('input', sincronizarTelefonoWa);
      modal.querySelector('#wa-est-contacto-select').addEventListener('change', function () {
        elegirContactoWa(this.value);
      });
      modal.querySelectorAll('#wa-est-plantillas [data-plantilla]').forEach(btn => {
        btn.onclick = () => usarPlantilla(btn.getAttribute('data-plantilla'));
      });
    }

    function cerrarModalWhatsApp() {
      const m = document.getElementById('modal-whatsapp-estructura');
      if (m) m.classList.add('hidden');
    }

    function sincronizarTelefonoWa() {
      const inp = document.getElementById('wa-est-telefono-input');
      if (!inp) return;
      const norm = normalizarTelefonoCO(inp.value.trim());
      waContext.telefono = norm || inp.value.trim();
      const disp = document.getElementById('wa-est-telefono-display');
      if (disp) disp.textContent = (norm || inp.value.trim()) || '—';
    }

    function llenarSelectContactosWa() {
      const sel = document.getElementById('wa-est-contacto-select');
      if (!sel) return;
      let html = '<option value="">— Seleccionar coordinador / líder / amigo —</option>';
      data.coordinadores.forEach(c => {
        if (c.telefono) {
          html += `<option value="coordinador|${c.id}">Coord: ${c.nombre} (${normalizarTelefonoCO(c.telefono)})</option>`;
        }
        (c.lideres || []).forEach(l => {
          if (l.telefono) {
            html += `<option value="lider|${l.id}">Líder: ${l.nombre} (${normalizarTelefonoCO(l.telefono)})</option>`;
          }
          (l.amigos || []).forEach(a => {
            if (a.telefono) {
              html += `<option value="amigo|${a.id}">Amigo: ${a.nombre} (${normalizarTelefonoCO(a.telefono)})</option>`;
            }
          });
        });
      });
      sel.innerHTML = html;
    }

    function elegirContactoWa(valor) {
      if (!valor) return;
      const [tipo, id] = valor.split('|');
      let persona = null;
      if (tipo === 'coordinador') persona = findCoordinador(id);
      else if (tipo === 'lider') {
        const f = findLider(id);
        persona = f ? f.lider : null;
      } else if (tipo === 'amigo') {
        for (const c of data.coordinadores) {
          for (const l of (c.lideres || [])) {
            const a = (l.amigos || []).find(x => x.id === id);
            if (a) { persona = a; break; }
          }
          if (persona) break;
        }
      }
      if (!persona) return;
      const tel = normalizarTelefonoCO(persona.telefono);
      waContext.telefono = tel;
      waContext.nombre = persona.nombre || '';
      waContext.tipo = tipo;
      waContext.id = id;
      const nom = document.getElementById('wa-est-nombre');
      if (nom) nom.textContent = persona.nombre || '—';
      const disp = document.getElementById('wa-est-telefono-display');
      if (disp) disp.textContent = tel || '—';
      const inp = document.getElementById('wa-est-telefono-input');
      if (inp) inp.value = tel;
      usarPlantilla('actividad');
    }

    function usarPlantilla(tipo) {
      const nombre = waContext.nombre || 'amigo/a';
      const barrio = waContext.barrio ? (' el barrio ' + waContext.barrio) : '';
      const enBarrio = waContext.barrio ? (' en el barrio ' + waContext.barrio) : ' en nuestra comunidad';
      const plantillas = {
        actividad: `Hola ${nombre} 👋\n\nTe comparto lo que estamos haciendo${enBarrio}.\n\nEstamos avanzando en actividades sociales y de organización para mejorar el territorio.\n\n¡Tú también haces parte de este proceso! 💪\n\nCarlos Cueto Mejía\nEdil Norte-Centro Histórico`,
        ayuda: `Hola ${nombre} 👋\n\nQueremos mejorar juntos el trabajo${enBarrio}.\n\n¿Cómo puedes ayudarnos?\n• Compartiendo la información con vecinos\n• Acompañándonos en las visitas\n• Dándonos ideas de lo que necesita el barrio\n\nTu apoyo es clave. ¿Cuentas con nosotros? 🤝\n\nCarlos Cueto Mejía`,
        invitacion: `Hola ${nombre} 👋\n\nTe invito a una reunión / actividad de nuestra estructura${enBarrio}.\n\n📅 Fecha: [completar]\n📍 Lugar: [completar]\n\nTu presencia es importante. ¡Te esperamos!\n\nCarlos Cueto Mejía`,
        cumpleanos: `¡Feliz cumpleaños ${nombre}! 🎂🎉\n\nEn este día especial queremos enviarte un abrazo grande.\n\nGracias por ser parte de nuestra estructura${barrio}.\n\nCarlos Cueto Mejía`,
        seguimiento: `Hola ${nombre} 👋\n\nTe escribo para hacer un seguimiento de nuestro trabajo${enBarrio}.\n\n¿Cómo has visto el avance? ¿Hay algo en lo que podamos mejorar?\n\n¡Un abrazo!`,
        personalizado: ''
      };
      const ta = document.getElementById('wa-est-mensaje');
      if (ta) ta.value = plantillas[tipo] || '';
    }

    function abrirSeguimiento(tipo, id) {
      let persona = null;
      if (tipo === 'coordinador') persona = findCoordinador(id);
      else if (tipo === 'lider') {
        const f = findLider(id);
        persona = f ? f.lider : null;
      } else if (tipo === 'amigo') {
        persona = personaPorClave('amigo|' + id);
      }
      if (!persona) return;
      const payload = {
        id: persona.id,
        nombre: persona.nombre || '',
        cedula: persona.cedula || '',
        telefono: persona.telefono || '',
        barrio: persona.barrio || '',
        tipo: tipo
      };
      if (window.App && window.App.instance && window.App.instance.seguimiento &&
          typeof window.App.instance.seguimiento.nuevoDesdePersona === 'function') {
        window.App.instance.seguimiento.nuevoDesdePersona(payload);
        return;
      }
      console.warn('[Estructura] Módulo Seguimiento no listo');
    }

    function abrirWhatsApp(tipo, id) {
      ensureModalWhatsApp();
      let persona = null;
      if (tipo === 'coordinador') persona = findCoordinador(id);
      else if (tipo === 'lider') {
        const f = findLider(id);
        persona = f ? f.lider : null;
      } else if (tipo === 'amigo') {
        for (const c of data.coordinadores) {
          for (const l of (c.lideres || [])) {
            const a = (l.amigos || []).find(x => x.id === id);
            if (a) { persona = a; break; }
          }
          if (persona) break;
        }
      }
      if (!persona || !persona.telefono) {
        alert('Esta persona no tiene teléfono registrado');
        return;
      }
      const telNorm = normalizarTelefonoCO(persona.telefono);
      waContext = {
        telefono: telNorm,
        nombre: persona.nombre || '',
        barrio: persona.barrio || persona.direccion || '',
        tipo: tipo,
        id: id,
        destinos: []
      };
      document.getElementById('wa-est-nombre').textContent = persona.nombre || 'Sin nombre';
      document.getElementById('wa-est-telefono-display').textContent = telNorm;
      document.getElementById('wa-est-telefono-input').value = telNorm;
      document.getElementById('wa-est-destino-label').textContent = esComputador()
        ? 'Recomendado: WhatsApp Web · ' + telNorm
        : 'App de WhatsApp · ' + telNorm;
      llenarSelectContactosWa();
      const sel = document.getElementById('wa-est-contacto-select');
      if (sel) sel.value = tipo + '|' + id;
      usarPlantilla('actividad');
      document.getElementById('modal-whatsapp-estructura').classList.remove('hidden');
    }

    /**
     * Envío SOLO por el bot (Socket/API). Sin popups, sin wa.me, sin autorización del navegador.
     */
    function enviarPorBot(tel, mensaje) {
      const numero = normalizarTelefonoCO(tel);
      const texto = String(mensaje || '').trim();
      if (!numero || numero.length < 12) {
        console.warn('[Estructura] Teléfono no válido:', tel);
        return false;
      }
      if (!texto) {
        console.warn('[Estructura] Mensaje vacío');
        return false;
      }

      // 0) Asegurar bot inicializado
      if (typeof initModuloMensajes === 'function') {
        try { initModuloMensajes(); } catch (e) { console.warn('[Estructura] initModuloMensajes:', e); }
      }

      // 1) API del módulo mensajes (preferida)
      if (window.App && window.App.instance && window.App.instance.mensajes) {
        const m = window.App.instance.mensajes;
        if (typeof m.enviar === 'function') {
          m.enviar({ to: numero, message: texto });
          console.info('[Estructura] Enviado por API bot →', numero);
          return true;
        }
        if (typeof m.send === 'function') {
          m.send(numero, texto);
          console.info('[Estructura] Enviado por API send →', numero);
          return true;
        }
      }
      if (typeof window.enviarMensajeBot === 'function') {
        window.enviarMensajeBot(numero, texto);
        console.info('[Estructura] Enviado por enviarMensajeBot →', numero);
        return true;
      }

      // 2) Socket.IO directo (sin popup / sin autorización)
      const sock = window.waSocket || window.socketMensajes || window.socket || (window.App && window.App.socket);
      if (sock && typeof sock.emit === 'function') {
        try {
          if (sock.connected !== false) {
            sock.emit('send-message', { to: numero, message: texto });
            console.info('[Estructura] Emit send-message →', numero);
            return true;
          }
        } catch (e) {
          console.warn('[Estructura] socket emit:', e);
        }
      }

      // 3) Panel bot: rellenar + clic automático (sin que el usuario pulse nada)
      const toInput = document.getElementById('wa-to');
      const msgInput = document.getElementById('wa-msg');
      const btnEnviar = document.getElementById('btn-wa-enviar');
      if (toInput && msgInput) {
        toInput.value = numero;
        msgInput.value = texto;
        try {
          toInput.dispatchEvent(new Event('input', { bubbles: true }));
          msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e) {}
        if (btnEnviar) {
          btnEnviar.click();
          console.info('[Estructura] Clic automático Enviar bot →', numero);
          return true;
        }
        return true;
      }

      return false;
    }

    /** Envío directo un clic → solo bot, sin alertas ni ventanas */
    function enviarWhatsAppDirecto(tipo, id) {
      let persona = null;
      if (tipo === 'lider') {
        const f = findLider(id);
        persona = f ? f.lider : null;
      } else if (tipo === 'coordinador') {
        persona = findCoordinador(id);
      } else if (tipo === 'amigo') {
        for (const c of data.coordinadores) {
          for (const l of (c.lideres || [])) {
            const a = (l.amigos || []).find(x => x.id === id);
            if (a) { persona = a; break; }
          }
          if (persona) break;
        }
      }
      if (!persona || !persona.telefono) {
        console.warn('[Estructura] Sin teléfono');
        return;
      }
      const tel = normalizarTelefonoCO(persona.telefono);
      if (!tel || tel.length < 12) {
        console.warn('[Estructura] Teléfono inválido');
        return;
      }
      const nombre = persona.nombre || 'amigo/a';
      const mensaje = `Hola ${nombre} 👋\n\nTe escribo desde la estructura organizacional.\n\n¡Un abrazo!\n\nCarlos Cueto Mejía\nEdil Norte-Centro Histórico`;

      if (!enviarPorBot(tel, mensaje)) {
        console.warn('[Estructura] Bot no disponible. Revisa la pestaña Mensajes.');
      }
    }

    async function enviarWhatsApp(/* forzarWeb ignorado */) {
      const inp = document.getElementById('wa-est-telefono-input');
      if (inp && inp.value.trim()) {
        waContext.telefono = inp.value.trim();
      }
      const tel = normalizarTelefonoCO((waContext && waContext.telefono) || '');
      const destinos = (waContext.destinos && waContext.destinos.length)
        ? waContext.destinos.slice()
        : [tel];
      const validos = destinos.map(normalizarTelefonoCO).filter(function (t) {
        return t && t.length >= 12 && t.indexOf('57') === 0;
      });
      if (!validos.length) {
        console.warn('[Estructura] Teléfono no válido');
        return;
      }
      if (inp && validos.length === 1) inp.value = validos[0];

      const mensaje = ((document.getElementById('wa-est-mensaje') || {}).value || '').trim();
      const fileInp = document.getElementById('wa-est-anexos');
      const files = (fileInp && fileInp.files) ? Array.prototype.slice.call(fileInp.files) : [];
      if (!mensaje && !files.length) {
        console.warn('[Estructura] Mensaje vacío');
        return;
      }

      cerrarModalWhatsApp();
      if (window.WhatsAppCola && typeof window.WhatsAppCola.encolarMasivo === 'function') {
        window.WhatsAppCola.encolarMasivo(validos, mensaje || 'Adjunto', files);
      } else if (window.WhatsAppCola && typeof window.WhatsAppCola.encolar === 'function') {
        for (let i = 0; i < validos.length; i++) {
          window.WhatsAppCola.encolar({ destino: validos[i], mensaje: mensaje || 'Adjunto', files: files });
        }
      }
      validos.forEach(function (t) { enviarPorBot(t, mensaje || 'Adjunto'); });
      if (fileInp) fileInp.value = '';
    }

    // Compatibilidad con el botón anterior
    function enviarWhatsAppLider(id) {
      enviarWhatsAppDirecto('lider', id);
    }

    function render() {
      const container = document.getElementById('lista-estructura');
      if (!container) return;

      let html = '';
      let items = [];
      let page = pageActual[subActual] || 1;

      if (subActual === 'coordinadores') {
        items = data.coordinadores.slice();
      } else if (subActual === 'lideres') {
        data.coordinadores.forEach(c => {
          (c.lideres || []).forEach(l => items.push({ ...l, _coordNombre: c.nombre, _coordId: c.id }));
        });
      } else {
        data.coordinadores.forEach(c => {
          (c.lideres || []).forEach(l => {
            (l.amigos || []).forEach(a => items.push({ ...a, _liderNombre: l.nombre, _coordNombre: c.nombre }));
          });
        });
      }

      // Filtros
      const f = getFiltros();
      const totalSinFiltro = items.length;
      items = items.filter(function (it) { return pasaFiltro(it, f); });

      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (page > totalPages) page = totalPages;
      pageActual[subActual] = page;
      const startIdx = (page - 1) * PAGE_SIZE;
      const pageItems = items.slice(startIdx, startIdx + PAGE_SIZE);

      if (!total) {
        if (subActual === 'coordinadores') {
          html = `<div class="text-center py-14 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 flex items-center justify-center"><i class="fas fa-user-tie text-2xl text-indigo-300"></i></div>
            <p class="font-medium text-slate-600">No hay coordinadores</p>
            <p class="text-sm mt-1">Sin resultados o lista vacía. Prueba quitar filtros o crea uno nuevo.</p>
          </div>`;
        } else if (subActual === 'lideres') {
          html = `<div class="text-center py-14 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center"><i class="fas fa-user-friends text-2xl text-blue-300"></i></div>
            <p class="font-medium text-slate-600">No hay líderes</p>
            <p class="text-sm mt-1">Primero crea coordinadores y luego líderes</p>
          </div>`;
        } else {
          html = `<div class="text-center py-14 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 flex items-center justify-center"><i class="fas fa-user text-2xl text-emerald-300"></i></div>
            <p class="font-medium text-slate-600">No hay amigos</p>
            <p class="text-sm mt-1">Primero crea líderes y luego amigos</p>
          </div>`;
        }
        container.innerHTML = html;
        return;
      }

      // Contador
      html += `<div class="flex flex-wrap justify-between items-center gap-2 mb-3 text-sm text-slate-500">
        <span>Mostrando <strong>${startIdx + 1}–${Math.min(startIdx + PAGE_SIZE, total)}</strong> de <strong>${total}</strong></span>
        <span>Página ${page} de ${totalPages}</span>
      </div>`;

      pageItems.forEach(item => {
        if (subActual === 'coordinadores') {
          const nL = (item.lideres || []).length;
          const nA = (item.lideres || []).reduce((a, l) => a + (l.amigos || []).length, 0);
          html += cardPersona(item, 'coordinador',
            `<p class="text-[11px] text-indigo-600 mt-1 font-medium">${nL} líder(es) · ${nA} amigo(s)</p>`);
        } else if (subActual === 'lideres') {
          const nA = (item.amigos || []).length;
          html += cardPersona(item, 'lider',
            `<p class="text-[11px] text-blue-600 mt-1 font-medium">Coordinador: ${item._coordNombre || ''} · ${nA} amigo(s)</p>`);
        } else {
          html += cardPersona(item, 'amigo',
            `<p class="text-[11px] text-emerald-600 mt-1 font-medium">Líder: ${item._liderNombre || ''} · Coord: ${item._coordNombre || ''}</p>`);
        }
      });

      // Controles de paginación
      if (totalPages > 1) {
        html += `<div class="flex flex-wrap items-center justify-center gap-2 mt-5 pt-4 border-t border-slate-200">
          <button type="button" class="est-page-btn px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40" data-page="1" ${page <= 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button type="button" class="est-page-btn px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-left"></i>
          </button>`;
        // números de página (ventana)
        let from = Math.max(1, page - 2);
        let to = Math.min(totalPages, from + 4);
        from = Math.max(1, to - 4);
        for (let p = from; p <= to; p++) {
          const active = p === page;
          html += `<button type="button" class="est-page-btn w-9 h-9 text-sm rounded-lg font-medium ${active ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white hover:bg-slate-50'}" data-page="${p}">${p}</button>`;
        }
        html += `
          <button type="button" class="est-page-btn px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-right"></i>
          </button>
          <button type="button" class="est-page-btn px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40" data-page="${totalPages}" ${page >= totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>`;
      }

      container.innerHTML = html;

      var resEl = document.getElementById('est-filtro-resumen');
      if (resEl) {
        var activos = 0;
        var ff = getFiltros();
        Object.keys(ff).forEach(function (k) { if (ff[k]) activos++; });
        if (activos) {
          resEl.textContent = 'Mostrando ' + total + ' de ' + totalSinFiltro + ' · ' + activos + ' filtro(s) activo(s)';
        } else {
          resEl.textContent = total ? ('Total: ' + total) : '';
        }
      }

      // Bind botones de página
      container.querySelectorAll('.est-page-btn').forEach(btn => {
        btn.onclick = function () {
          const p = parseInt(btn.getAttribute('data-page'), 10);
          if (!p || p < 1) return;
          pageActual[subActual] = p;
          render();
          const lista = document.getElementById('lista-estructura');
          if (lista) lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
      });

      container.querySelectorAll('.est-wa-chk').forEach(function (chk) {
        chk.onchange = function () {
          toggleSelWa(chk.getAttribute('data-tipo'), chk.getAttribute('data-id'), chk.checked);
        };
      });
      actualizarBarraMasivo();
    }

    function editar(tipo, id) {
      if (tipo === 'coordinador') {
        const c = findCoordinador(id);
        if (c) openForm('coordinador', c);
      } else if (tipo === 'lider') {
        const f = findLider(id);
        if (f) openForm('lider', f.lider, f.coordinador.id);
      } else if (tipo === 'amigo') {
        for (const c of data.coordinadores) {
          for (const l of (c.lideres || [])) {
            const a = (l.amigos || []).find(x => x.id === id);
            if (a) {
              openForm('amigo', a, l.id);
              return;
            }
          }
        }
      }
    }

    // =====================================================
    //  UI AUTO-INYECCIÓN (incluye Barrio, Puesto y Mesa)
    // =====================================================
    let uiInyectada = false;

    function inyectarUI() {
      if (uiInyectada) return;
      if (!document.body) return;

      // 1. Pestaña
      const tabsContainer = document.querySelector('.flex.space-x-2.py-2');
      if (tabsContainer && !document.getElementById('tab-estructura')) {
        const btn = document.createElement('button');
        btn.id = 'tab-estructura';
        btn.className = 'tab-btn px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-all';
        btn.innerHTML = '<i class="fas fa-sitemap mr-2"></i>Estructura';
        btn.onclick = function () {
          if (typeof cambiarModulo === 'function') cambiarModulo('estructura');
          if (window.App && window.App.instance && window.App.instance.estructura) {
            window.App.instance.estructura.init();
          }
        };
        tabsContainer.appendChild(btn);
      }

      // 2. Sección completa
      const main = document.querySelector('main');
      if (main && !document.getElementById('modulo-estructura')) {
        const section = document.createElement('section');
        section.id = 'modulo-estructura';
        section.className = 'modulo-seccion fade-in';
        section.style.display = 'none';
        section.innerHTML = `
          <header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 class="text-2xl font-bold text-slate-800">Estructura Organizacional</h1>
              <p class="text-slate-500 text-sm mt-0.5">Coordinadores → Líderes → Amigos / Votantes</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button id="btn-importar-estructura" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 border border-slate-200">
                <i class="fas fa-file-import"></i> Importar
              </button>
              <input type="file" id="est-import-file" accept=".csv,.xlsx,.xls,.txt" class="hidden">
              <button id="btn-nuevo-estructura" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm flex items-center gap-2">
                <i class="fas fa-plus"></i> <span id="btn-nuevo-estructura-texto">Nuevo Coordinador</span>
              </button>
            </div>
          </header>

          <div class="flex flex-wrap gap-2 mb-6">
            <button type="button" class="est-sub-btn px-4 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 transition-all" data-sub="coordinadores">
              <i class="fas fa-user-tie mr-1.5"></i> Coordinadores
            </button>
            <button type="button" class="est-sub-btn px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-all" data-sub="lideres">
              <i class="fas fa-user-friends mr-1.5"></i> Líderes
            </button>
            <button type="button" class="est-sub-btn px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-all" data-sub="amigos">
              <i class="fas fa-user mr-1.5"></i> Amigos / Votantes
            </button>
          </div>

          <!-- Formulario -->
          <div id="form-estructura" class="hidden mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-center">
              <h3 id="form-estructura-titulo" class="font-bold text-base">Nuevo Coordinador</h3>
              <button type="button" id="btn-cerrar-form-estructura" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg leading-none">&times;</button>
            </div>
            <div class="p-5 space-y-4">
              <input type="hidden" id="est-tipo" value="coordinador">
              <input type="hidden" id="est-edit-id" value="">

              <div id="est-parent-wrap" class="hidden">
                <label id="est-parent-label" class="block text-xs font-semibold text-slate-600 mb-1.5">Pertenece a</label>
                <select id="est-parent" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">— Seleccionar —</option>
                </select>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Cédula *</label>
                  <input type="text" id="est-cedula" inputmode="numeric" placeholder="Solo números" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Nombre completo *</label>
                  <input type="text" id="est-nombre" placeholder="Nombre y apellidos" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Barrio *</label>
                  <input type="text" id="est-barrio" list="est-barrio-list" placeholder="Escribe o elige el barrio" autocomplete="off" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <datalist id="est-barrio-list"></datalist>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Localidad *</label>
                  <select id="est-localidad" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">— Se asigna al elegir barrio —</option>
                    <option value="Norte-Centro Histórico">Norte-Centro Histórico</option>
                    <option value="Riomar">Riomar</option>
                    <option value="Metropolitana">Metropolitana</option>
                    <option value="Suroriente">Suroriente</option>
                    <option value="Suroccidente">Suroccidente</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Teléfono</label>
                <input type="text" id="est-telefono" placeholder="3001234567" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Puesto de votación</label>
                  <input type="text" id="est-puesto" placeholder="Ej: Colegio San José" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Mesa</label>
                  <input type="text" id="est-mesa" inputmode="numeric" placeholder="Ej: 12" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Dirección</label>
                <input type="text" id="est-direccion" placeholder="Calle / carrera / casa" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              </div>

              <div id="est-foto-wrap">
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                  <i class="fas fa-camera mr-1 text-slate-400"></i> Foto (opcional, máx. 1.2 MB)
                </label>
                <input type="file" id="est-foto" accept="image/*" class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100 file:transition">
                <img id="est-foto-preview" src="" alt="Vista previa" class="mt-3 w-20 h-20 rounded-xl object-cover border border-slate-200 hidden">
              </div>

              <div class="flex gap-3 pt-2">
                <button type="button" id="btn-cancelar-estructura" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl transition text-sm">
                  Cancelar
                </button>
                <button type="button" id="btn-guardar-estructura" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2">
                  <i class="fas fa-save"></i> Guardar
                </button>
              </div>
            </div>
          </div>

          <div id="est-filtros" class="mb-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p class="text-sm font-semibold text-slate-700"><i class="fas fa-filter mr-1.5 text-indigo-500"></i>Filtros</p>
              <button type="button" id="est-filtro-limpiar" class="text-xs text-slate-500 hover:text-indigo-600 font-medium">Limpiar filtros</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 mb-1">Nombre</label>
                <input type="text" id="est-filtro-nombre" placeholder="Buscar nombre..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 mb-1">Cédula</label>
                <input type="text" id="est-filtro-cedula" inputmode="numeric" placeholder="Solo números" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 mb-1">Barrio</label>
                <input type="text" id="est-filtro-barrio" placeholder="Barrio..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 mb-1">Líder</label>
                <input type="text" id="est-filtro-lider" placeholder="Nombre del líder..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 mb-1">Coordinador</label>
                <input type="text" id="est-filtro-coordinador" placeholder="Nombre del coordinador..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 mb-1">Puesto de votación</label>
                <input type="text" id="est-filtro-puesto" placeholder="Puesto..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
            </div>
            <p id="est-filtro-resumen" class="text-[11px] text-slate-400 mt-2"></p>
          </div>

          <div id="lista-estructura" class="space-y-3">
            <div class="text-center py-10 text-slate-400">
              <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p>Cargando estructura...</p>
            </div>
          </div>
        `;
        main.appendChild(section);
      }

      asegurarBarraFiltros();
      uiInyectada = true;
      console.log('[Estructura] UI lista (filtros activos)');
    }



    function asegurarBarraFiltros() {
      if (document.getElementById('est-filtros')) {
        bindToggleFiltros();
        return;
      }
      var lista = document.getElementById('lista-estructura');
      if (!lista || !lista.parentNode) return;

      var wrap = document.createElement('div');
      wrap.id = 'est-filtros';
      wrap.className = 'mb-4';
      wrap.innerHTML =
        '<div class="flex flex-wrap items-center gap-2 mb-2">' +
        '<button type="button" id="est-filtro-toggle" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition shadow-sm">' +
        '<i class="fas fa-filter text-indigo-500"></i><span>Filtros</span>' +
        '<i id="est-filtro-chevron" class="fas fa-chevron-down text-xs text-slate-400 transition-transform"></i></button>' +
        '<button type="button" id="est-filtro-limpiar" class="hidden text-xs text-slate-500 hover:text-indigo-600 font-medium px-2 py-1">Limpiar filtros</button>' +
        '<span id="est-filtro-resumen" class="text-[11px] text-slate-400"></span></div>' +
        '<div id="est-filtros-panel" class="hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Nombre</label>' +
        '<input type="text" id="est-filtro-nombre" placeholder="Buscar nombre..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></div>' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Cédula</label>' +
        '<input type="text" id="est-filtro-cedula" inputmode="numeric" placeholder="Solo números" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></div>' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Barrio</label>' +
        '<input type="text" id="est-filtro-barrio" placeholder="Barrio..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></div>' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Líder</label>' +
        '<input type="text" id="est-filtro-lider" placeholder="Nombre del líder..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></div>' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Coordinador</label>' +
        '<input type="text" id="est-filtro-coordinador" placeholder="Nombre del coordinador..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></div>' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Puesto de votación</label>' +
        '<input type="text" id="est-filtro-puesto" placeholder="Puesto..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></div>' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Estado de visita (amigos)</label>' +
        '<select id="est-filtro-visita" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">' +
        '<option value="">Todos</option><option value="realizado">Visitado</option>' +
        '<option value="pendiente">Pendiente</option><option value="no_asistio">No estaba</option>' +
        '<option value="no_militante">No militante</option></select></div>' +
        '</div></div>';

      lista.parentNode.insertBefore(wrap, lista);
      bindToggleFiltros();
      console.log('[Estructura] Barra de filtros insertada');
    }

    function bindToggleFiltros() {
      var btn = document.getElementById('est-filtro-toggle');
      var panel = document.getElementById('est-filtros-panel');
      var chev = document.getElementById('est-filtro-chevron');
      var limpiar = document.getElementById('est-filtro-limpiar');
      if (!btn || !panel || btn._filtroBound) return;
      btn._filtroBound = true;
      btn.onclick = function () {
        var abierto = !panel.classList.contains('hidden');
        if (abierto) {
          panel.classList.add('hidden');
          if (chev) chev.style.transform = '';
          if (limpiar) limpiar.classList.add('hidden');
          btn.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
        } else {
          panel.classList.remove('hidden');
          if (chev) chev.style.transform = 'rotate(180deg)';
          if (limpiar) limpiar.classList.remove('hidden');
          btn.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
        }
      };
    }


    // ==================== IMPORTAR CSV / Excel ====================
    function parseCSVLine(line) {
      const result = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; continue; }
        cur += ch;
      }
      result.push(cur.trim());
      return result;
    }

    function importarArchivo(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        let text = e.target.result || '';
        // Si es Excel y hay XLSX, parsear
        if ((file.name || '').match(/\.xlsx?$/i) && typeof XLSX !== 'undefined') {
          try {
            const wb = XLSX.read(e.target.result, { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            text = XLSX.utils.sheet_to_csv(sheet);
          } catch (err) {
            alert('No se pudo leer el Excel: ' + err.message);
            return;
          }
        }
        const lines = String(text).split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          alert('El archivo está vacío o no tiene datos');
          return;
        }
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        const idx = {
          cedula: headers.findIndex(h => h.includes('cedula') || h === 'cc' || h === 'documento'),
          nombre: headers.findIndex(h => h.includes('nombre')),
          barrio: headers.findIndex(h => h.includes('barrio')),
          localidad: headers.findIndex(h => h.includes('localidad')),
          telefono: headers.findIndex(h => h.includes('telefono') || h.includes('celular') || h.includes('whatsapp')),
          direccion: headers.findIndex(h => h.includes('direccion') || h.includes('dir')),
          puesto: headers.findIndex(h => h.includes('puesto')),
          mesa: headers.findIndex(h => h.includes('mesa')),
          tipo: headers.findIndex(h => h.includes('tipo') || h.includes('nivel')),
          padre: headers.findIndex(h => h.includes('padre') || h === 'coordinador_cedula' || h.includes('pertenece') || (h.includes('cedula') && (h.includes('coord') || h.includes('lider') || h.includes('padre'))))
        };
        if (idx.cedula < 0 || idx.nombre < 0) {
          alert('El archivo debe tener columnas Cédula y Nombre');
          return;
        }

        const cedulas = todasLasCedulas();
        let ok = 0, dup = 0, err = 0;

        function findCoordByCedula(cc) {
          cc = String(cc || '').replace(/\D/g, '');
          if (!cc) return null;
          return data.coordinadores.find(function (c) {
            return String(c.cedula || '').replace(/\D/g, '') === cc;
          }) || null;
        }
        function findLiderByCedula(cc) {
          cc = String(cc || '').replace(/\D/g, '');
          if (!cc) return null;
          var found = null;
          data.coordinadores.forEach(function (c) {
            (c.lideres || []).forEach(function (l) {
              if (!found && String(l.cedula || '').replace(/\D/g, '') === cc) {
                found = { coord: c, lider: l };
              }
            });
          });
          return found;
        }

        function leerCampos(cols) {
          var cedula = String(cols[idx.cedula] || '').replace(/\D/g, '');
          var nombre = capitalizarNombre(String(cols[idx.nombre] || '').trim());
          var barrio = idx.barrio >= 0 ? String(cols[idx.barrio] || '').trim() : '';
          var localidad = idx.localidad >= 0 ? String(cols[idx.localidad] || '').trim() : 'Norte-Centro Histórico';
          var telefono = idx.telefono >= 0 ? String(cols[idx.telefono] || '').replace(/\D/g, '') : '';
          var direccion = idx.direccion >= 0 ? String(cols[idx.direccion] || '').trim() : '';
          var puestoVotacion = idx.puesto >= 0 ? String(cols[idx.puesto] || '').trim() : '';
          var mesa = idx.mesa >= 0 ? String(cols[idx.mesa] || '').replace(/\D/g, '') : '';
          var tipo = idx.tipo >= 0 ? String(cols[idx.tipo] || '').toLowerCase() : 'amigo';
          if (tipo.indexOf('coord') >= 0) tipo = 'coordinador';
          else if (tipo.indexOf('lid') >= 0) tipo = 'lider';
          else tipo = 'amigo';
          var padre = idx.padre >= 0 ? String(cols[idx.padre] || '').replace(/\D/g, '') : '';
          return {
            cedula: cedula, nombre: nombre, barrio: barrio, localidad: localidad,
            telefono: telefono, direccion: direccion, puestoVotacion: puestoVotacion,
            mesa: mesa, tipo: tipo, padre: padre
          };
        }

        var filas = [];
        for (var i = 1; i < lines.length; i++) {
          var cols = parseCSVLine(lines[i]);
          if (!cols.length) continue;
          var nom0 = String(cols[idx.nombre] || '').trim().toLowerCase();
          // saltar fila de ayuda del template
          if (nom0.indexOf('obligatorio') >= 0 || nom0.indexOf('nombre completo') >= 0) continue;
          filas.push({ cols: cols, fila: i + 1 });
        }

        // Pase 1: coordinadores
        filas.forEach(function (f) {
          var r = leerCampos(f.cols);
          if (!r.cedula || !r.nombre || r.tipo !== 'coordinador') return;
          if (cedulas.has(r.cedula)) {
            pushErrorCedula({ cedula: r.cedula, nombre: r.nombre, barrio: r.barrio, motivo: 'Cédula duplicada al importar (fila ' + f.fila + ')' });
            dup++; return;
          }
          data.coordinadores.push({
            id: uid('CO'), cedula: r.cedula, nombre: r.nombre, localidad: r.localidad, barrio: r.barrio,
            direccion: r.direccion, telefono: r.telefono, puestoVotacion: r.puestoVotacion, mesa: r.mesa, lideres: []
          });
          cedulas.add(r.cedula);
          ok++;
        });

        // Pase 2: líderes
        filas.forEach(function (f) {
          var r = leerCampos(f.cols);
          if (!r.cedula || !r.nombre || r.tipo !== 'lider') return;
          if (cedulas.has(r.cedula)) {
            pushErrorCedula({ cedula: r.cedula, nombre: r.nombre, barrio: r.barrio, motivo: 'Cédula duplicada al importar (fila ' + f.fila + ')' });
            dup++; return;
          }
          var coord = findCoordByCedula(r.padre) || data.coordinadores[0];
          if (!coord) {
            pushErrorCedula({ cedula: r.cedula, nombre: r.nombre, motivo: 'Sin coordinador (padre_cedula) para líder fila ' + f.fila });
            err++; return;
          }
          coord.lideres = coord.lideres || [];
          coord.lideres.push({
            id: uid('LI'), cedula: r.cedula, nombre: r.nombre, localidad: r.localidad, barrio: r.barrio,
            direccion: r.direccion, telefono: r.telefono, puestoVotacion: r.puestoVotacion, mesa: r.mesa,
            coordinadorId: coord.id, amigos: []
          });
          cedulas.add(r.cedula);
          ok++;
        });

        // Pase 3: amigos
        filas.forEach(function (f) {
          var r = leerCampos(f.cols);
          if (!r.cedula || !r.nombre || r.tipo !== 'amigo') return;
          if (cedulas.has(r.cedula)) {
            pushErrorCedula({ cedula: r.cedula, nombre: r.nombre, barrio: r.barrio, motivo: 'Cédula duplicada al importar (fila ' + f.fila + ')' });
            dup++; return;
          }
          var found = findLiderByCedula(r.padre);
          if (!found) {
            data.coordinadores.forEach(function (c) {
              if (!found && (c.lideres || []).length) found = { coord: c, lider: c.lideres[0] };
            });
          }
          if (!found) {
            pushErrorCedula({ cedula: r.cedula, nombre: r.nombre, motivo: 'Sin líder (padre_cedula) para amigo fila ' + f.fila });
            err++; return;
          }
          found.lider.amigos = found.lider.amigos || [];
          found.lider.amigos.push({
            id: uid('AM'), cedula: r.cedula, nombre: r.nombre, localidad: r.localidad, barrio: r.barrio,
            direccion: r.direccion, telefono: r.telefono, puestoVotacion: r.puestoVotacion, mesa: r.mesa,
            liderId: found.lider.id
          });
          cedulas.add(r.cedula);
          ok++;
        });

        save();
        render();
        alert('Importación terminada:\n✅ Agregados: ' + ok + '\n⚠️ Duplicados → Errores: ' + dup + '\n❌ Con error: ' + err);
      };

      if ((file.name || '').match(/\.xlsx?$/i) && typeof XLSX !== 'undefined') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, 'UTF-8');
      }
    }


    function asegurarBarraMasivo() {
      if (document.getElementById('est-wa-masivo')) return;
      const lista = document.getElementById('lista-estructura');
      if (!lista || !lista.parentNode) return;
      const bar = document.createElement('div');
      bar.id = 'est-wa-masivo';
      bar.className = 'hidden mb-4 flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3';
      bar.innerHTML =
        '<p class="text-sm text-emerald-900"><i class="fab fa-whatsapp mr-1"></i> <strong id="est-wa-masivo-n">0</strong> seleccionados para envío masivo</p>' +
        '<div class="flex gap-2">' +
        '<button type="button" id="est-wa-masivo-limpiar" class="text-xs px-3 py-2 rounded-lg border border-emerald-200 bg-white">Limpiar</button>' +
        '<button type="button" id="est-wa-masivo-enviar" class="text-xs px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Enviar masivo</button>' +
        '</div>';
      lista.parentNode.insertBefore(bar, lista);
      document.getElementById('est-wa-masivo-limpiar').onclick = function () {
        Object.keys(seleccionWa).forEach(function (k) { delete seleccionWa[k]; });
        render();
      };
      document.getElementById('est-wa-masivo-enviar').onclick = function () {
        abrirWhatsAppMasivo();
      };
    }

    function bindUI() {
      asegurarBarraFiltros();
      asegurarBarraMasivo();
      bindToggleFiltros();
      const btnNuevo = document.getElementById('btn-nuevo-estructura');
      const btnG = document.getElementById('btn-guardar-estructura');
      const btnX = document.getElementById('btn-cancelar-estructura');
      const btnCerrar = document.getElementById('btn-cerrar-form-estructura');

      document.querySelectorAll('.est-sub-btn').forEach(btn => {
        btn.onclick = () => setSub(btn.getAttribute('data-sub'));
      });

      if (btnNuevo) {
        btnNuevo.onclick = () => {
          if (subActual === 'coordinadores') {
            openForm('coordinador');
          } else if (subActual === 'lideres') {
            if (!data.coordinadores.length) {
              alert('Primero crea al menos un Coordinador');
              return;
            }
            openForm('lider');
          } else {
            const tieneLider = data.coordinadores.some(c => (c.lideres || []).length);
            if (!tieneLider) {
              alert('Primero crea al menos un Líder');
              return;
            }
            openForm('amigo');
          }
        };
      }
      if (btnG) btnG.onclick = () => { guardar(); };
      if (btnX) btnX.onclick = closeForm;
      if (btnCerrar) btnCerrar.onclick = closeForm;

      const fotoInput = document.getElementById('est-foto');
      const fotoPreview = document.getElementById('est-foto-preview');
      if (fotoInput && fotoPreview) {
        fotoInput.onchange = () => {
          const file = fotoInput.files && fotoInput.files[0];
          if (!file) {
            fotoPreview.classList.add('hidden');
            fotoPreview.src = '';
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            fotoPreview.src = reader.result;
            fotoPreview.classList.remove('hidden');
          };
          reader.readAsDataURL(file);
        };
      }

      // Cédula: solo números mientras se escribe
      const cedulaInput = document.getElementById('est-cedula');
      if (cedulaInput) {
        cedulaInput.addEventListener('input', function () {
          this.value = this.value.replace(/\D/g, '');
        });
      }
      // Mesa: solo números
      const mesaInput = document.getElementById('est-mesa');
      if (mesaInput) {
        mesaInput.addEventListener('input', function () {
          this.value = this.value.replace(/\D/g, '');
        });
      }
      var nomInput = document.getElementById('est-nombre');
      if (nomInput && !nomInput._capBound) {
        nomInput._capBound = true;
        nomInput.addEventListener('blur', function () {
          this.value = capitalizarNombre(this.value);
        });
      }

      // Localidad → Barrios
      const locSel = document.getElementById('est-localidad');
      if (locSel) locSel.onchange = onLocalidadChange;
      const barrioSel = document.getElementById('est-barrio');
      if (barrioSel) {
        barrioSel.onchange = onBarrioChange;
        barrioSel.oninput = onBarrioChange;
      }
      llenarSelectBarrios('', '');

      // Filtros
      ['est-filtro-nombre','est-filtro-cedula','est-filtro-barrio','est-filtro-lider','est-filtro-coordinador','est-filtro-puesto','est-filtro-visita'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', function () {
          if (id === 'est-filtro-cedula') this.value = this.value.replace(/\D/g, '');
          aplicarFiltrosUI();
        });
      });
      var btnLimpiar = document.getElementById('est-filtro-limpiar');
      if (btnLimpiar) btnLimpiar.onclick = limpiarFiltros;

      // Importar
      const btnImp = document.getElementById('btn-importar-estructura');
      const fileImp = document.getElementById('est-import-file');
      if (btnImp && fileImp) {
        btnImp.onclick = function () { fileImp.click(); };
        fileImp.onchange = function () {
          if (fileImp.files && fileImp.files[0]) {
            importarArchivo(fileImp.files[0]);
            fileImp.value = '';
          }
        };
      }
    }

    return {
      getData: function () { return data; },
      init: function () {
        inyectarUI();
        load();
        bindUI();
        setSub('coordinadores');

        // Si Supabase aún no estaba listo, recargar cuando se conecte
        if (!getSupabase()) {
          window.addEventListener('supabase-ready', function onReady() {
            window.removeEventListener('supabase-ready', onReady);
            console.log('[Estructura] Supabase listo → recargando datos...');
            load();
          }, { once: true });
        }

        // Registrar puente al bot de Mensajes para otros módulos
        try {
          window.App = window.App || {};
          window.App.instance = window.App.instance || {};
          if (!window.App.instance.mensajes || typeof window.App.instance.mensajes.enviar !== 'function') {
            window.App.instance.mensajes = window.App.instance.mensajes || {};
            window.App.instance.mensajes.enviar = function (opts) {
              const to = (opts && (opts.to || opts.numero || opts.telefono)) || '';
              const message = (opts && (opts.message || opts.mensaje || opts.texto)) || '';
              return enviarPorBot(to, message);
            };
          }
        } catch (e) {}
      },
      editar: editar,
      eliminar: eliminar,
      verInfo: verInfo,
      renderErrores: renderErrores,
      esNegativo: esNegativo,
      abrirSeguimiento: abrirSeguimiento,
      abrirWhatsApp: abrirWhatsApp,
      abrirWhatsAppMasivo: abrirWhatsAppMasivo,
      toggleSelWa: toggleSelWa,
      enviarWhatsApp: enviarWhatsApp,
      enviarWhatsAppDirecto: enviarWhatsAppDirecto,
      enviarWhatsAppLider: enviarWhatsAppLider,
      usarPlantilla: usarPlantilla,
      agregarLider: function (coordId) {
        setSub('lideres');
        openForm('lider', null, coordId);
      },
      agregarAmigo: function (liderId) {
        setSub('amigos');
        openForm('amigo', null, liderId);
      }
    };
  }

  global.App = global.App || {};
  global.App.Estructura = { create: createEstructura };

  // Auto-bootstrap: crea la instancia y la deja lista
  function bootstrapEstructura() {
    global.App.instance = global.App.instance || {};
    if (!global.App.instance.estructura) {
      const instancia = createEstructura();
      global.App.instance.estructura = instancia;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          instancia.init();
        });
      } else {
        setTimeout(function () { instancia.init(); }, 80);
      }
    }
  }

  bootstrapEstructura();
})(typeof window !== 'undefined' ? window : globalThis);
