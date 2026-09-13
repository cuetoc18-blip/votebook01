/**
 * Módulo Info Votante — puestos de votación por localidad
 * y cruce con Coordinador / Líder / Amigo (Estructura)
 * © 2026 Carlos Cueto Mejía
 */
(function (global) {
  'use strict';

  var LOCALIDADES = [
    'Norte-Centro Histórico',
    'Riomar',
    'Metropolitana',
    'Suroriente',
    'Suroccidente'
  ];

  function createInfoVotante() {
    var uiInyectada = false;
    var filtroLoc = '';
    var filtroTexto = '';
    var vista = 'puestos'; // puestos | estructura

    // Datos embebidos (no depende de archivo externo)
    var PUESTOS_EMBED = [{"zona":"01","puesto_num":"02","nombre":"IDETH SEDE PRINCIPAL SEDE II","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CALLE 63B N°28 87"},{"zona":"01","puesto_num":"03","nombre":"COL.DTAL OLAYA(ANT C.E.B.108)","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 70 B #27-36"},{"zona":"01","puesto_num":"04","nombre":"COL DISTRITAL MARIA INMACULADA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"KR 29 #70B-60"},{"zona":"02","puesto_num":"01","nombre":"IE DISTRITAL LA MERCED","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 57 No 30-23"},{"zona":"02","puesto_num":"03","nombre":"IED KARL PARRISH","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 27 No 47-171"},{"zona":"02","puesto_num":"04","nombre":"COL.CAMILO TORRES","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CARRERA 35 No. 51B - 37"},{"zona":"03","puesto_num":"02","nombre":"COLEGIO AMERICANO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CARRERA 38 No. 74 -179"},{"zona":"03","puesto_num":"03","nombre":"IED CARLOS MEISEL","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 74 No 24-139"},{"zona":"03","puesto_num":"04","nombre":"C.DTAL.EL SILENCIO(ANT CEB 050","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 73 C #26 B 2-55"},{"zona":"04","puesto_num":"01","nombre":"I.E.D. JAVIER SANCHEZ","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 63C #20B-28"},{"zona":"04","puesto_num":"04","nombre":"COL.DTAL.LA SALLE","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 70 C #18-47"},{"zona":"05","puesto_num":"02","nombre":"IDETH SEDE I PRIMARIA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 26 No 56 A 14"},{"zona":"05","puesto_num":"03","nombre":"IED SALVADOR SUAREZ SUAREZ","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 25B No 55 - 12"},{"zona":"05","puesto_num":"04","nombre":"JORGE NICOLAS ABELLO SD 2","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 64 No 24C-82"},{"zona":"06","puesto_num":"01","nombre":"I.E.D.INOCENCIO CHINCA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 53-D- #21B-181"},{"zona":"06","puesto_num":"03","nombre":"IED SALVADOR ENTREGAS","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 58 No 20B -40"},{"zona":"07","puesto_num":"01","nombre":"COLEGIO DISTRITAL MARIE POUSSEPIN","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 51 No 20-103"},{"zona":"07","puesto_num":"02","nombre":"IED DAVID SANCHEZ JULIAO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 64C No 16-30"},{"zona":"08","puesto_num":"01","nombre":"INST.LAS MERCEDES COL.SAN PABL","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CL 106 #12F-50"},{"zona":"08","puesto_num":"02","nombre":"COLEGIO CRISTIANO PENIEL","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CALLE 107 No. 12F-25"},{"zona":"08","puesto_num":"04","nombre":"COLEGIO SANTA MARIA DE LA PROVIDENCIA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"Carrera 10 No 98B 07"},{"zona":"08","puesto_num":"05","nombre":"FUNDACION CE CAMILO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 100 No 12F-35"},{"zona":"09","puesto_num":"02","nombre":"COL MANUEL ELKIN PATARROYO SD 1","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 26 No 85-61"},{"zona":"10","puesto_num":"01","nombre":"COL. TEC. SAN CARLOS BORROMEO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"Calle 112E No.22-10"},{"zona":"10","puesto_num":"03","nombre":"IED BETSABE ESPINOSA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"Calle 120 No 25 77"},{"zona":"11","puesto_num":"01","nombre":"CENTRO DE EDUCACION BASICA C.E.B.161","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 118 No 10J - 72"},{"zona":"11","puesto_num":"03","nombre":"NODO SENA CONSTRUCCION","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"DIAGONAL 136 No 9G - 20"},{"zona":"11","puesto_num":"04","nombre":"MEGA COLEGIO IED VILLAS DE SAN PABLO","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"DIAGONAL 136 No 9 D - 60"},{"zona":"11","puesto_num":"05","nombre":"COL ALBERTO ASSA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CALLE 101 No. 6L - 170"},{"zona":"12","puesto_num":"01","nombre":"COL. JOSE RAIMUNDO SOJO (MEGA)","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"Carrera 9J 1 Calle 78 Diagonal 70C"},{"zona":"12","puesto_num":"03","nombre":"E.D.EVARISTO SOURDIS SEDE 2","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CALLE 75 No. 9A - 23"},{"zona":"13","puesto_num":"02","nombre":"IED LA ESMERALDA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 84B No 13E - 26"},{"zona":"13","puesto_num":"03","nombre":"INST. EDUCATIVA EVARDO TURIZO PALENCIA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 13 No 84-14"},{"zona":"14","puesto_num":"02","nombre":"IED ESPERANZA DEL SUR","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 8C No 93-92"},{"zona":"14","puesto_num":"04","nombre":"IED LOS ROSALES","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CLL 98D No 9J-23"},{"zona":"15","puesto_num":"01","nombre":"INS.TEC.DIST.CRUZADA SOCIAL","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CLL 55 #13C-57"},{"zona":"15","puesto_num":"02","nombre":"INST EDUC DIST SIMON BOLIVAR","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CL 46B #14-27"},{"zona":"15","puesto_num":"03","nombre":"IEDT MEIRA DELMAR SD 2 (ANT. CEB MEDIA)","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"KR 13 #45C 5-19"},{"zona":"16","puesto_num":"01","nombre":"COL DIST DE B/QUILLA GABRIEL GARCIA M","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CLL 45B No 19-141"},{"zona":"16","puesto_num":"02","nombre":"I.E.D.LA VICTORIA","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CARRERA 10C No. 45-46"},{"zona":"16","puesto_num":"03","nombre":"NUEVO COL. TEC. DEL SANTUARIO.","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Calle 47B No. 8D-60"},{"zona":"17","puesto_num":"03","nombre":"I.D.E.STA.MARIA(MEGACOLEGIO)","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"KR 5 SUR #78B-80"},{"zona":"17","puesto_num":"04","nombre":"IED SANTO DOMINGO DE GUZMAN","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CRA 2 # 78-36"},{"zona":"18","puesto_num":"01","nombre":"I.E.D. SAN LUIS SEDE 2 (LAS GARDENIAS)","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"calle 98 N 2 sur 05"},{"zona":"18","puesto_num":"04","nombre":"IED DESPERTAR DEL SUR","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Carera 3B No 52B 28"},{"zona":"18","puesto_num":"05","nombre":"IED LAS GARDENIAS","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Calle 98C No 1E 99"},{"zona":"19","puesto_num":"01","nombre":"IED GERMAN VARGAS CANTILLO FE Y ALEGRIA","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Carrera 15 Sur No.46-500"},{"zona":"19","puesto_num":"03","nombre":"I.D.E.COL.CIUD.ESTUD.(ANT 186)","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"CARRERA 1A No. 47 - 49"},{"zona":"19","puesto_num":"04","nombre":"I.E.D. REUVEN FEUERSTEIN","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Carrera 1B No.46G-18"},{"zona":"20","puesto_num":"01","nombre":"COL.MIGUEL ANGEL BUILES BLQ1","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"KR 2F #50D-27 CARRIZAL BLOQUE 1"},{"zona":"20","puesto_num":"02","nombre":"COL.MIGUEL ANGEL BUILES BLQ2","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"calle 50E N 2B-54"},{"zona":"20","puesto_num":"05","nombre":"IED TEC METROPOLITANO DE BARRANQUILLA","localidad_raw":"02LOCALIDAD 2 METROPOLITANA","localidad":"Metropolitana","direccion":"Calle 46 No 1Sur 445"},{"zona":"21","puesto_num":"02","nombre":"COL.LA PRESENTACION","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 33 #33-194"},{"zona":"22","puesto_num":"01","nombre":"COL.TEC.DISTR.DE REBOLO","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"calle 6a N 32-05"},{"zona":"22","puesto_num":"02","nombre":"CENTRO SOCIAL DON BOSCO SD 2","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CLL 30 No 36-28 BARRIO SAN ROQUE"},{"zona":"22","puesto_num":"03","nombre":"COLEGIO MADRE MARIA SARA ALVARADO","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Calle 34 No 26 08"},{"zona":"22","puesto_num":"04","nombre":"IED COLEGIO SAGRADO CORAZON DE JESUS","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CRA 32 No 41-34"},{"zona":"23","puesto_num":"01","nombre":"SENA SAN JOSE MULTIPLE BILINGUE","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CLL 40B N 21 -142"},{"zona":"23","puesto_num":"02","nombre":"COL SAN JOSE SD 1","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Carrera 21 No. 39-10"},{"zona":"23","puesto_num":"03","nombre":"COL.DTAL.SAN GABRIEL SEDE No1","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Kra 19 No. 35-58"},{"zona":"23","puesto_num":"04","nombre":"I.E.D.LA UNION SEDE 2","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CARRERA 18 No. 36B - 105"},{"zona":"24","puesto_num":"02","nombre":"COL.OCTAVIO PAZ","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 1 F #41B-05"},{"zona":"24","puesto_num":"03","nombre":"I.E.D.LOS LAURELES","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CALLE 37C No. 1H - 10"},{"zona":"24","puesto_num":"04","nombre":"I.E.D.MARCO FIDEL SUAREZ","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 6B #36B-46"},{"zona":"25","puesto_num":"01","nombre":"I.E.D.NTRA.SRA. DE LAS NIEVES","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 10 #23-13"},{"zona":"25","puesto_num":"02","nombre":"COLEGIO SANTA TERESITA","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 19 #24-22"},{"zona":"25","puesto_num":"03","nombre":"I.E.D.CALIXTO ALVAREZ","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 15 #21-11"},{"zona":"25","puesto_num":"04","nombre":"IED JOSE MARTI","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CLL 17 No 8B-05"},{"zona":"26","puesto_num":"01","nombre":"INT.DTAL.CASTILLO LA ALBORAYA","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"calle 41b N 8a-42"},{"zona":"26","puesto_num":"02","nombre":"COL.DTAL.BUENOS AIRES\"CODIBA\"","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CALLE 44 CARRERA 5B ESQUINA"},{"zona":"26","puesto_num":"03","nombre":"COL.DTAL.MARIA AUXILIADORA","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 38B #7D-56"},{"zona":"26","puesto_num":"04","nombre":"COLEGIO DE COMFAMILIAR","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 37C KR 6 ESQ"},{"zona":"27","puesto_num":"01","nombre":"INST.ELENA DE CHAUVIN","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 20C #21-66"},{"zona":"27","puesto_num":"02","nombre":"I.E. DISTRITAL LAS NIEVES 1","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CRA 15 No 23-115"},{"zona":"27","puesto_num":"03","nombre":"COL.LAS NIEVES SEDE 2","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 27 #21B-27"},{"zona":"27","puesto_num":"05","nombre":"IED LA LUZ","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Carrera 23 Calle 12 Esquina"},{"zona":"28","puesto_num":"01","nombre":"I E D BARRIO SIMON BOLIVAR BTO","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"Carrera 5A No.19-15"},{"zona":"28","puesto_num":"02","nombre":"I.E.D.LUZ DEL CARIBE","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CALLE 27B No. 6A - 19"},{"zona":"28","puesto_num":"03","nombre":"COL.DISTRITAL JORGE ISAAC","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"KR 4A #24B 3-21"},{"zona":"28","puesto_num":"04","nombre":"I.DIST.SIMON BOLIVAR PRIMARIA","localidad_raw":"03LOCALIDAD NO.3 SUR ORIENTE","localidad":"Suroriente","direccion":"CL 17 KR 8 ESQ"},{"zona":"29","puesto_num":"01","nombre":"COLEGIO MAYOR DE BARRANQUILLA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CLL 44 No 44 - 97"},{"zona":"29","puesto_num":"02","nombre":"I.E.D.VILLANUEVA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 5 KR 42D-24"},{"zona":"29","puesto_num":"03","nombre":"IED BRISAS DEL RIO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"VIA 40 No 46A-50"},{"zona":"29","puesto_num":"04","nombre":"E.NOR.SUPERIOR DEL DTO BQUILLA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 47 #44-100"},{"zona":"29","puesto_num":"05","nombre":"INST.LA SALLE","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 47 #41-33"},{"zona":"30","puesto_num":"01","nombre":"INST. TEC.DE COMERCIO DE BARRANQUILLA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CLL 47 No 42-60"},{"zona":"30","puesto_num":"02","nombre":"IT DE COMERCIO DE BQUILLA SD 2","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CALLE 39 No 38-63"},{"zona":"30","puesto_num":"03","nombre":"I E D NUESTRA SEÑORA DEL ROSARIO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 43 No. 46-98"},{"zona":"30","puesto_num":"05","nombre":"COLEGIO ATENEO TECNICO COMERCIAL","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA 41 No 51 -111"},{"zona":"31","puesto_num":"01","nombre":"IU DE BARRANQUILLA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CR 45 No 48-31"},{"zona":"31","puesto_num":"02","nombre":"INST. TEC. NACIONAL DE COMERCIO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA 62 No 52 -85"},{"zona":"31","puesto_num":"03","nombre":"INST. TEC. NACIONAL DE COMERCIO SEDE 2","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CLL 52 No 62 - 06"},{"zona":"31","puesto_num":"04","nombre":"ID DE EDUCACION ARTISTICA Y CULTURAL ALE","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Calle 52 No 55 21"},{"zona":"31","puesto_num":"05","nombre":"ANTONIO JOSE DE SUCRE SEDE 1","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CLL 54 No 64 - 30"},{"zona":"31","puesto_num":"06","nombre":"COLISEO UNIVERSIDAD SIMON BOLIVAR SD 1","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA 54 No 58-132"},{"zona":"32","puesto_num":"02","nombre":"NUEVO COLEGIO DEL PRADO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"KR 62 #75-156"},{"zona":"32","puesto_num":"03","nombre":"IED LA CONCEPCION","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CARRERA 70 No 77A-27"},{"zona":"32","puesto_num":"04","nombre":"COLEGIO DEL SAGRADO CORAZON 74","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Calle 74 No 60 35"},{"zona":"32","puesto_num":"05","nombre":"CENTRO COMERCIAL LE MERIDIEM GOLF","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Carrera 59B No 81 158"},{"zona":"33","puesto_num":"03","nombre":"COL.NTRA.SEÑORA DE NAZARETH","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 81 #73-19"},{"zona":"33","puesto_num":"04","nombre":"COL.NTRA.SEÑORA DE LOURDES","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"KR 49 #70-122"},{"zona":"33","puesto_num":"05","nombre":"COL.BARRANQUILLA CODEBA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 68 #47-64"},{"zona":"33","puesto_num":"06","nombre":"IED SANTA BERNARDITA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CALLE 69D No 39 - 23"},{"zona":"34","puesto_num":"01","nombre":"COL.SAGRADA FAMILIA","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 72 #38-79"},{"zona":"34","puesto_num":"03","nombre":"SEM.CONCILIAR SAN LUIS BELTRAN","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CL 75-B #42F-83"},{"zona":"34","puesto_num":"04","nombre":"COL.INST.ARIANO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CALLE 79 No. 42 - 318"},{"zona":"35","puesto_num":"03","nombre":"CORPORACION EL LITORAL SD I","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA. 42F No 79-110"},{"zona":"35","puesto_num":"04","nombre":"CENTRO COMERCIAL MIRAMAR","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"CRA 43 No 99 50"},{"zona":"35","puesto_num":"05","nombre":"CENTRO COMERCIAL JARDIN DEL RIO","localidad_raw":"04LOCALIDAD NO.4 NORTE CENTRO HISTORICO","localidad":"Norte-Centro Histórico","direccion":"Calle No 114 No 42C 33"},{"zona":"36","puesto_num":"02","nombre":"COLEGIO EL BUEN CONCEJO","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CL 90 #53-95"},{"zona":"36","puesto_num":"04","nombre":"UNIVERSIDAD AUTONOMA DEL CARIBE","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CLL 90 No 46 - 112"},{"zona":"36","puesto_num":"06","nombre":"C. COMERCIAL Y EMPRESARIAL BLUE GARDENS","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"Carrera 53 No 100 50"},{"zona":"37","puesto_num":"01","nombre":"I.E SANTA MAGDALENA SOFIA","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CLL 84B No 76 -17"},{"zona":"37","puesto_num":"03","nombre":"C.E.D.LIBERTADOR SIMON BOLIVAR","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CL 106 KR 85"},{"zona":"37","puesto_num":"04","nombre":"INSTITUTO LAS AMERICAS","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"Cl. 85 No 78D 45"},{"zona":"38","puesto_num":"03","nombre":"COL.LA ENSEÑANZA","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CL 86 #52-119"},{"zona":"38","puesto_num":"04","nombre":"CENTRO COMERCIAL VIVA BARRANQUILLA","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"Carrera 51B No 87 50"},{"zona":"38","puesto_num":"05","nombre":"COLEGIO MARYMOUNT","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CRA 59 No 84-226"},{"zona":"99","puesto_num":"11","nombre":"IED SAN VICENTE DE PAUL","localidad_raw":"05LOCALIDAD NO.5 RIOMAR","localidad":"Riomar","direccion":"CRA10 # 5-136"},{"zona":"99","puesto_num":"25","nombre":"I.E. DISTRITAL JUAN MINA","localidad_raw":"01LOCALIDAD NO.1 SUR OCCIDENTE","localidad":"Suroccidente","direccion":"CRA 7 No 7 - 27"}];


    // Colegios usados en Estructura que no salen en IDC o con nombre distinto
    // → se fuerzan a su localidad real
    var PUESTO_LOCALIDAD_ALIAS = {
      'colegio colon': 'Norte-Centro Histórico',
      'colegio colón': 'Norte-Centro Histórico',
      'colon': 'Norte-Centro Histórico',
      'colón': 'Norte-Centro Histórico',
      'colegio del colegio colon': 'Norte-Centro Histórico'
    };

    // Puestos extra (no están en el PDF IDC pero se usan en la estructura)
    var PUESTOS_EXTRA = [
      { zona: '—', puesto_num: '—', nombre: 'COLEGIO COLON', localidad_raw: '04LOCALIDAD NO.4 NORTE CENTRO HISTORICO', localidad: 'Norte-Centro Histórico', direccion: 'Barranquilla' }
    ];

    function getPuestos() {
      var base = (global.PUESTOS_BARRANQUILLA_2026 && global.PUESTOS_BARRANQUILLA_2026.length)
        ? global.PUESTOS_BARRANQUILLA_2026.slice()
        : PUESTOS_EMBED.slice();
      // Agregar extras si no existen
      PUESTOS_EXTRA.forEach(function (ex) {
        var n = norm(ex.nombre);
        var exists = base.some(function (p) { return norm(p.nombre) === n; });
        if (!exists) base.push(ex);
      });
      return base;
    }


    function getEstructura() {
      try {
        var est = global.App && global.App.instance && global.App.instance.estructura;
        if (est && typeof est.getData === 'function') return est.getData();
        var raw = localStorage.getItem('estructura_organizacional_v1');
        return raw ? JSON.parse(raw) : { coordinadores: [] };
      } catch (e) {
        return { coordinadores: [] };
      }
    }

    /** Todas las personas con puesto asignado */
    function personasConPuesto() {
      var data = getEstructura();
      var lista = [];
      (data.coordinadores || []).forEach(function (c) {
        lista.push({
          rol: 'Coordinador',
          id: c.id,
          nombre: c.nombre || '',
          cedula: c.cedula || '',
          barrio: c.barrio || '',
          localidad: c.localidad || '',
          puesto: c.puestoVotacion || c.puesto || '',
          mesa: c.mesa || '',
          telefono: c.telefono || ''
        });
        (c.lideres || []).forEach(function (l) {
          if (String(l.estado || '').toLowerCase() !== 'negativo') {
            lista.push({
              rol: 'Líder',
              id: l.id,
              nombre: l.nombre || '',
              cedula: l.cedula || '',
              barrio: l.barrio || '',
              localidad: l.localidad || '',
              puesto: l.puestoVotacion || l.puesto || '',
              mesa: l.mesa || '',
              telefono: l.telefono || '',
              coordinador: c.nombre || ''
            });
          }
          (l.amigos || []).forEach(function (a) {
            if (String(a.estado || '').toLowerCase() === 'negativo') return;
            lista.push({
              rol: 'Amigo',
              id: a.id,
              nombre: a.nombre || '',
              cedula: a.cedula || '',
              barrio: a.barrio || '',
              localidad: a.localidad || '',
              puesto: a.puestoVotacion || a.puesto || '',
              mesa: a.mesa || '',
              telefono: a.telefono || '',
              lider: l.nombre || '',
              coordinador: c.nombre || ''
            });
          });
        });
      });
      return lista;
    }

    function norm(s) {
      return String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    }

    function matchPuestoNombre(personaPuesto, puestoNombre) {
      if (!personaPuesto || !puestoNombre) return false;
      var a = norm(personaPuesto);
      var b = norm(puestoNombre);
      if (!a || !b) return false;
      return a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0;
    }

    function personasEnPuesto(puestoNombre) {
      return personasConPuesto().filter(function (p) {
        return matchPuestoNombre(p.puesto, puestoNombre);
      });
    }


    /** Localidad del catálogo oficial según nombre del puesto/colegio */
    function localidadDePuesto(nombrePuesto) {
      if (!nombrePuesto) return '';
      var q = norm(nombrePuesto);
      // Alias manual (ej. Colegio Colón → Norte-Centro Histórico)
      if (PUESTO_LOCALIDAD_ALIAS[q]) return PUESTO_LOCALIDAD_ALIAS[q];
      var aliasKeys = Object.keys(PUESTO_LOCALIDAD_ALIAS);
      for (var ai = 0; ai < aliasKeys.length; ai++) {
        var ak = aliasKeys[ai];
        if (q.indexOf(ak) >= 0 || ak.indexOf(q) >= 0) return PUESTO_LOCALIDAD_ALIAS[ak];
      }
      var best = null;
      var bestScore = 0;
      getPuestos().forEach(function (p) {
        var n = norm(p.nombre);
        if (!n) return;
        if (n === q) { best = p; bestScore = 10000; return; }
        if (bestScore >= 10000) return;
        if (n.indexOf(q) >= 0 || q.indexOf(n) >= 0) {
          var score = 1000 + Math.min(n.length, q.length);
          if (score > bestScore) { best = p; bestScore = score; }
          return;
        }
        // tokens significativos (evita "de","del","la")
        var tq = q.split(/\s+/).filter(function (w) { return w.length > 3; });
        var tn = n.split(/\s+/).filter(function (w) { return w.length > 3; });
        var hits = 0;
        tq.forEach(function (w) {
          if (tn.indexOf(w) >= 0 || n.indexOf(w) >= 0) hits++;
        });
        if (hits > 0 && hits >= Math.ceil(tq.length * 0.6)) {
          var score = hits * 50;
          if (score > bestScore) { best = p; bestScore = score; }
        }
      });
      return best ? (best.localidad || '') : '';
    }

    /** Resuelve localidad de una persona: catálogo del puesto > campo propio */
    function localidadPersona(per) {
      var fromPuesto = localidadDePuesto(per.puesto);
      if (fromPuesto) return fromPuesto;
      var loc = (per.localidad || '').trim();
      if (LOCALIDADES.indexOf(loc) >= 0) return loc;
      return '';
    }

    function puestosFiltrados() {
      var list = getPuestos();
      if (filtroLoc) {
        list = list.filter(function (p) { return p.localidad === filtroLoc; });
      }
      if (filtroTexto) {
        var q = norm(filtroTexto);
        list = list.filter(function (p) {
          return norm(p.nombre).indexOf(q) >= 0 ||
            norm(p.direccion).indexOf(q) >= 0 ||
            norm(p.localidad).indexOf(q) >= 0;
        });
      }
      return list;
    }

    function inyectarUI() {
      if (uiInyectada) return;

      // Reemplazar pestaña Mapa → Info Votante
      var tabMapa = document.getElementById('tab-mapa');
      if (tabMapa) {
        tabMapa.id = 'tab-infovotante';
        tabMapa.innerHTML = '<i class="fas fa-vote-yea mr-2"></i>Info Votante';
        tabMapa.onclick = function () {
          if (typeof cambiarModulo === 'function') cambiarModulo('infovotante');
        };
      }

      // Rellenar sección (placeholder del index o mapa viejo)
      var sec = document.getElementById('modulo-infovotante') || document.getElementById('modulo-mapa');
      if (sec) {
        sec.id = 'modulo-infovotante';
        sec.className = 'modulo-seccion fade-in';
        sec.innerHTML = buildHTML();
      } else {
        var main = document.querySelector('main');
        if (main) {
          sec = document.createElement('section');
          sec.id = 'modulo-infovotante';
          sec.className = 'modulo-seccion fade-in';
          sec.style.display = 'none';
          sec.innerHTML = buildHTML();
          main.appendChild(sec);
        }
      }

      // Tab
      if (!document.getElementById('tab-infovotante')) {
        var tabMapa = document.getElementById('tab-mapa');
        if (tabMapa) {
          tabMapa.id = 'tab-infovotante';
          tabMapa.innerHTML = '<i class="fas fa-vote-yea mr-2"></i>Info Votante';
          tabMapa.setAttribute('onclick', "cambiarModulo('infovotante')");
        } else {
          var tabs = document.querySelector('.flex.space-x-2.py-2');
          if (tabs) {
            var btn = document.createElement('button');
            btn.id = 'tab-infovotante';
            btn.className = 'tab-btn px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-all';
            btn.innerHTML = '<i class="fas fa-vote-yea mr-2"></i>Info Votante';
            btn.onclick = function () {
              if (typeof cambiarModulo === 'function') cambiarModulo('infovotante');
            };
            tabs.appendChild(btn);
          }
        }
      }

      bindUI();
      uiInyectada = true;
      console.log('[InfoVotante] UI lista · puestos:', getPuestos().length);
    }

    function buildHTML() {
      var locOpts = '<option value="">Todas las localidades</option>';
      LOCALIDADES.forEach(function (l) {
        locOpts += '<option value="' + l + '">' + l + '</option>';
      });
      return (
        '<header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">' +
        '<div><h1 class="text-2xl font-bold text-slate-800">Info Votante</h1>' +
        '<p class="text-slate-500 text-sm mt-0.5">Votos por localidad y ranking de puestos</p></div>' +
        '</header>' +

        '<div class="grid grid-cols-1 sm:grid-cols-1 gap-3 mb-5 max-w-xs">' +
        '<div class="bg-white rounded-xl border border-slate-200 p-4 text-center"><p class="text-2xl font-bold text-amber-600" id="iv-stat-sin">0</p><p class="text-xs text-slate-500 mt-1">Sin puesto</p></div>' +
        '</div>' +

        '<div id="iv-filtros" class="mb-5">' +
        '<div class="flex flex-wrap items-center gap-2 mb-2">' +
        '<button type="button" id="iv-filtro-toggle" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition shadow-sm">' +
        '<i class="fas fa-filter text-indigo-500"></i><span>Filtros</span>' +
        '<i id="iv-filtro-chevron" class="fas fa-chevron-down text-xs text-slate-400 transition-transform"></i></button>' +
        '<button type="button" id="iv-filtro-limpiar" class="hidden text-xs text-slate-500 hover:text-indigo-600 font-medium px-2 py-1">Limpiar</button>' +
        '</div>' +
        '<div id="iv-filtros-panel" class="hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-sm" style="display:none">' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Localidad</label>' +
        '<select id="iv-filtro-loc" class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">' + locOpts + '</select></div>' +
        '<div><label class="block text-[11px] font-semibold text-slate-500 mb-1">Buscar puesto / dirección</label>' +
        '<input type="text" id="iv-filtro-texto" placeholder="Nombre del colegio, dirección..." class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"></div>' +
        '</div></div></div>' +

        '<div id="iv-contenido" class="space-y-4"></div>'
      );
    }

    function actualizarStats() {
      var personas = personasConPuesto();
      var sin = personas.filter(function (p) { return !(p.puesto && String(p.puesto).trim()); }).length;
      var elS = document.getElementById('iv-stat-sin');
      if (elS) elS.textContent = sin;
    }

    function render() {
      actualizarStats();
      var box = document.getElementById('iv-contenido');
      if (!box) return;
      renderLocalidadesYPuestos(box);
      bindMapaLoc();
    }

    function bindMapaLoc() {
      function aplicarFiltro(loc) {
        filtroLoc = loc || '';
        var sel = document.getElementById('iv-filtro-loc');
        if (sel) sel.value = filtroLoc;
        render();
      }

      document.querySelectorAll('[data-iv-loc]').forEach(function (el) {
        el.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          aplicarFiltro(el.getAttribute('data-iv-loc') || '');
        };
      });

      // Clic en el mapa = resetear todo
      var mapa = document.getElementById('iv-mapa-wrap');
      if (mapa) {
        mapa.onclick = function (e) {
          e.preventDefault();
          aplicarFiltro('');
        };
      }

      var lim = document.getElementById('iv-mapa-limpiar');
      if (lim) {
        lim.onclick = function (e) {
          e.preventDefault();
          aplicarFiltro('');
        };
      }

      // Efecto 3D al mover el mouse
      var mapa3d = document.getElementById('iv-mapa-3d');
      if (mapa3d && !mapa3d._tiltBound) {
        mapa3d._tiltBound = true;
        var wrap = mapa3d.parentElement;
        if (wrap) {
          wrap.onmousemove = function (ev) {
            var r = wrap.getBoundingClientRect();
            var x = (ev.clientX - r.left) / r.width - 0.5;
            var y = (ev.clientY - r.top) / r.height - 0.5;
            mapa3d.style.transform = 'rotateX(' + (12 - y * 8) + 'deg) rotateY(' + (x * 10) + 'deg) rotateZ(-2deg)';
          };
          wrap.onmouseleave = function () {
            mapa3d.style.transform = 'rotateX(12deg) rotateZ(-2deg)';
          };
        }
      }
    }


    function renderLocalidadesYPuestos(box) {
      var personas = personasConPuesto().filter(function (p) {
        return !!(p.puesto && String(p.puesto).trim());
      });
      // Si hay filtro de localidad en personas sin puesto oficial, igual contar por localidad de la persona
      var todos = personasConPuesto();
      if (filtroLoc) {
        todos = todos.filter(function (p) { return localidadPersona(p) === filtroLoc; });
        personas = personas.filter(function (p) { return localidadPersona(p) === filtroLoc; });
      }
      if (filtroTexto) {
        var q = norm(filtroTexto);
        todos = todos.filter(function (p) {
          return norm(p.nombre).indexOf(q) >= 0 || norm(p.puesto).indexOf(q) >= 0 || norm(p.barrio).indexOf(q) >= 0;
        });
        personas = personas.filter(function (p) {
          return norm(p.nombre).indexOf(q) >= 0 || norm(p.puesto).indexOf(q) >= 0 || norm(p.barrio).indexOf(q) >= 0;
        });
      }

      // Votos por localidad = personas asignadas, localidad tomada del COLEGIO/puesto oficial
      var votosLoc = {};
      LOCALIDADES.forEach(function (l) { votosLoc[l] = 0; });
          todos.forEach(function (p) {
        var loc = localidadPersona(p);
        if (!loc || LOCALIDADES.indexOf(loc) < 0) return; // no contar sin localidad válida
        if (votosLoc[loc] === undefined) votosLoc[loc] = 0;
        votosLoc[loc]++;
      });

      var locOrden = LOCALIDADES.map(function (l) {
        return { loc: l, votos: votosLoc[l] || 0 };
      });
      // Incluir localidades extra (ej. Sin localidad) si tienen votos
      // No mostrar "Sin localidad" ni otras claves fuera de las 5 localidades oficiales
      locOrden.sort(function (a, b) { return b.votos - a.votos; });

      var maxLoc = Math.max(1, locOrden.length ? locOrden[0].votos : 1);
      var html = '';

      // Bloque votos por localidad
      html += '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">';
      html += '<div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">';
      html += '<h3 class="font-bold text-slate-800 text-sm"><i class="fas fa-map-marked-alt text-indigo-500 mr-2"></i>Votos por localidad</h3>';
      html += '<span class="text-xs text-slate-500">Clic localidad = filtrar · clic mapa = todas</span></div>';

      var posMap = {
        'Riomar': { top: '14%', left: '48%' },
        'Norte-Centro Histórico': { top: '30%', left: '68%' },
        'Suroccidente': { top: '48%', left: '26%' },
        'Suroriente': { top: '50%', left: '76%' },
        'Metropolitana': { top: '74%', left: '40%' }
      };
      var colores = {
        'Riomar': { bg: 'bg-teal-500', ring: 'ring-teal-300', text: 'text-white' },
        'Norte-Centro Histórico': { bg: 'bg-orange-400', ring: 'ring-orange-300', text: 'text-white' },
        'Suroccidente': { bg: 'bg-yellow-400', ring: 'ring-yellow-300', text: 'text-slate-800' },
        'Suroriente': { bg: 'bg-stone-300', ring: 'ring-stone-400', text: 'text-slate-800' },
        'Metropolitana': { bg: 'bg-emerald-700', ring: 'ring-emerald-400', text: 'text-white' }
      };

      html += '<div class="p-4 md:p-6 bg-gradient-to-b from-slate-50 to-white">';
      html += '<div class="relative mx-auto max-w-lg" style="perspective:900px;">';
      html += '<div id="iv-mapa-3d" class="relative transition-transform duration-500 ease-out" style="transform:rotateX(12deg) rotateZ(-2deg); transform-style:preserve-3d;">';
      // Clic en mapa (fondo) resetea
      html += '<div id="iv-mapa-wrap" class="rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white cursor-pointer" title="Clic para ver todas" style="box-shadow:0 25px 50px -12px rgba(15,23,42,0.35);">';
      html += '<img src="img/barranquilla-localidades.webp" alt="Localidades de Barranquilla" class="w-full h-auto block select-none pointer-events-none">';
      html += '</div>';

      locOrden.forEach(function (row) {
        if (filtroLoc && row.loc !== filtroLoc) return;
        var pos = posMap[row.loc];
        if (!pos) return;
        var c = colores[row.loc] || { bg: 'bg-indigo-500', ring: 'ring-indigo-300' };
        var activo = filtroLoc === row.loc;
        html += '<button type="button" data-iv-loc="' + row.loc + '" class="iv-loc-badge absolute transform -translate-x-1/2 -translate-y-1/2 text-center cursor-pointer group z-10" style="top:' + pos.top + ';left:' + pos.left + ';">';
        html += '<div class="px-3 py-2 rounded-2xl shadow-xl border-2 border-white min-w-[5rem] transition-all duration-200 ' + c.bg + ' ' + (c.text || 'text-white') + (activo ? ' ring-4 ' + c.ring + ' scale-110' : ' group-hover:scale-125 group-hover:ring-4 group-hover:' + c.ring) + '" style="box-shadow:0 8px 20px rgba(0,0,0,0.25);">';
        html += '<p class="text-xl font-black leading-none">' + row.votos + '</p>';
        html += '<p class="text-[9px] font-bold uppercase tracking-wide opacity-95 mt-0.5">votos</p>';
        html += '</div>';
        html += '<p class="mt-1.5 text-[10px] font-extrabold rounded-lg px-2 py-1 shadow-md leading-tight max-w-[8rem] border border-white/40 ' + c.bg + ' ' + (c.text || 'text-white') + ' group-hover:brightness-110 transition">' + row.loc + '</p>';
        html += '</button>';
      });

      html += '</div></div>';

      html += '<div class="mt-6 space-y-2.5">';
      locOrden.forEach(function (row) {
        if (filtroLoc && row.loc !== filtroLoc) return;
        var pct = Math.round((row.votos / maxLoc) * 100);
        var c = colores[row.loc] || { bg: 'bg-indigo-500' };
        var activo = filtroLoc === row.loc;
        html += '<button type="button" data-iv-loc="' + row.loc + '" class="iv-loc-bar w-full text-left rounded-xl px-3 py-2 transition border ' + (activo ? 'border-indigo-300 bg-indigo-50' : 'border-transparent hover:bg-slate-50 hover:border-slate-200') + '">';
        html += '<div class="flex justify-between text-sm mb-1">';
        html += '<span class="font-semibold text-slate-700">' + row.loc + '</span>';
        html += '<span class="font-bold text-indigo-600">' + row.votos + ' votos</span></div>';
        html += '<div class="h-3 rounded-full bg-slate-100 overflow-hidden">';
        html += '<div class="h-full rounded-full ' + c.bg + ' transition-all duration-500" style="width:' + (row.votos ? Math.max(5, pct) : 0) + '%"></div></div>';
        html += '</button>';
      });
      html += '</div>';

      if (filtroLoc) {
        html += '<p class="text-center mt-3"><button type="button" id="iv-mapa-limpiar" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">Mostrar todas las localidades</button></p>';
      }

      html += '</div></div>';

      // Ranking puestos mayor → menor (sin lista de nombres/chips)
      var list = puestosFiltrados();
      var conteo = {};
      personas.forEach(function (per) {
        var key = norm(per.puesto);
        if (!key) return;
        if (!conteo[key]) conteo[key] = { total: 0, label: per.puesto, localidad: per.localidad || '' };
        conteo[key].total++;
        if (!conteo[key].localidad && per.localidad) conteo[key].localidad = per.localidad;
      });

      var ranking = [];
      Object.keys(conteo).forEach(function (k) {
        var c = conteo[k];
        // buscar dirección en catálogo
        var meta = null;
        list.forEach(function (p) {
          var n = norm(p.nombre);
          if (n === k || n.indexOf(k) >= 0 || k.indexOf(n) >= 0) meta = p;
        });
        ranking.push({
          nombre: (meta && meta.nombre) || c.label,
          direccion: (meta && meta.direccion) || '',
          localidad: (meta && meta.localidad) || localidadDePuesto(c.label) || c.localidad || '',
          total: c.total
        });
      });
      ranking.sort(function (a, b) { return b.total - a.total; });
      if (filtroLoc) {
        ranking = ranking.filter(function (r) {
          return r.localidad === filtroLoc || !r.localidad;
        });
        // si tienen localidad vacía, intentar resolver
        ranking = ranking.filter(function (r) {
          var loc = r.localidad || localidadDePuesto(r.nombre);
          return loc === filtroLoc;
        });
      }
      if (filtroTexto) {
        var q2 = norm(filtroTexto);
        ranking = ranking.filter(function (r) {
          return norm(r.nombre).indexOf(q2) >= 0 || norm(r.direccion).indexOf(q2) >= 0;
        });
      }

      html += '<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">';
      html += '<div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">';
      html += '<h3 class="font-bold text-slate-800 text-sm"><i class="fas fa-sort-amount-down text-indigo-500 mr-2"></i>Puestos (mayor → menor)</h3>';
      html += '<span class="text-xs text-slate-500">' + ranking.length + ' con asignados</span></div>';

      if (!ranking.length) {
        html += '<p class="text-center text-slate-400 text-sm py-10">Asigna puestos de votación en Estructura para ver el ranking</p></div>';
        box.innerHTML = html;
        return;
      }

      var maxP = ranking[0].total || 1;
      html += '<div class="divide-y divide-slate-100">';
      ranking.forEach(function (r, idx) {
        var pct = Math.round((r.total / maxP) * 100);
        html += '<div class="px-4 py-3 flex flex-wrap items-center gap-3 justify-between">';
        html += '<div class="flex items-start gap-3 min-w-0 flex-1">';
        html += '<span class="text-xs font-bold text-slate-400 pt-0.5">#' + (idx + 1) + '</span>';
        html += '<div class="min-w-0"><p class="font-semibold text-slate-800 text-sm truncate">' + r.nombre + '</p>';
        if (r.localidad || r.direccion) {
          html += '<p class="text-[11px] text-slate-500 truncate">' + (r.localidad ? r.localidad + (r.direccion ? ' · ' : '') : '') + (r.direccion || '') + '</p>';
        }
        html += '<div class="mt-1.5 h-1.5 rounded-full bg-slate-100 max-w-xs overflow-hidden"><div class="h-full bg-indigo-500 rounded-full" style="width:' + Math.max(6, pct) + '%"></div></div>';
        html += '</div></div>';
        html += '<div class="text-right shrink-0"><p class="text-xl font-bold text-indigo-600">' + r.total + '</p><p class="text-[10px] text-slate-400">votos</p></div>';
        html += '</div>';
      });
      html += '</div></div>';

      box.innerHTML = html;
    }


    function renderPuestos(box) {
      var list = puestosFiltrados();
      var personas = personasConPuesto().filter(function (p) {
        return !!(p.puesto && String(p.puesto).trim());
      });

      // Contar personas por puesto (nombre normalizado)
      var conteo = {};
      var detalle = {};
      personas.forEach(function (per) {
        var key = norm(per.puesto);
        if (!key) return;
        if (!conteo[key]) {
          conteo[key] = { total: 0, coordinador: 0, lider: 0, amigo: 0, label: per.puesto };
          detalle[key] = [];
        }
        conteo[key].total++;
        if (per.rol === 'Coordinador') conteo[key].coordinador++;
        else if (per.rol === 'Líder') conteo[key].lider++;
        else conteo[key].amigo++;
        detalle[key].push(per);
      });

      // Unir con catálogo oficial de puestos
      var ranking = list.map(function (p) {
        var key = norm(p.nombre);
        var c = conteo[key] || { total: 0, coordinador: 0, lider: 0, amigo: 0 };
        // también buscar coincidencia parcial
        if (!c.total) {
          Object.keys(conteo).forEach(function (k) {
            if (k.indexOf(key) >= 0 || key.indexOf(k) >= 0) {
              if (conteo[k].total > c.total) {
                c = conteo[k];
                key = k;
              }
            }
          });
        }
        return {
          puesto: p,
          total: c.total || 0,
          coordinador: c.coordinador || 0,
          lider: c.lider || 0,
          amigo: c.amigo || 0,
          matchKey: key
        };
      });

      // Incluir puestos solo de Estructura que no están en catálogo
      var nombresCatalogo = {};
      list.forEach(function (p) { nombresCatalogo[norm(p.nombre)] = true; });
      Object.keys(conteo).forEach(function (k) {
        var matched = ranking.some(function (r) {
          return r.matchKey === k || norm(r.puesto.nombre).indexOf(k) >= 0 || k.indexOf(norm(r.puesto.nombre)) >= 0;
        });
        if (!matched && conteo[k].total > 0) {
          ranking.push({
            puesto: {
              nombre: conteo[k].label,
              direccion: '(registrado en Estructura)',
              localidad: '',
              zona: '—',
              puesto_num: '—'
            },
            total: conteo[k].total,
            coordinador: conteo[k].coordinador,
            lider: conteo[k].lider,
            amigo: conteo[k].amigo,
            matchKey: k
          });
        }
      });

      // Solo con gente asignada, o todos si el usuario quiere ver ranking completo
      var soloConGente = ranking.filter(function (r) { return r.total > 0; });
      var usar = soloConGente.length ? soloConGente : ranking;

      // Mayor → menor
      usar.sort(function (a, b) {
        if (b.total !== a.total) return b.total - a.total;
        return String(a.puesto.nombre || '').localeCompare(String(b.puesto.nombre || ''));
      });

      if (!usar.length) {
        box.innerHTML = '<div class="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">' +
          '<p class="font-medium text-slate-600">No hay personas asignadas a puestos</p>' +
          '<p class="text-sm mt-1">En Estructura asigna el <strong>Puesto de votación</strong> a coordinadores, líderes y amigos</p></div>';
        return;
      }

      var max = usar[0].total || 1;
      var html = '';
      html += '<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">';
      html += '<div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between gap-2 items-center">';
      html += '<h3 class="font-bold text-slate-800 text-sm"><i class="fas fa-sort-amount-down text-indigo-500 mr-2"></i>Puestos por cantidad de votantes asignados</h3>';
      html += '<span class="text-xs text-slate-500">' + usar.length + ' puestos con gente · mayor → menor</span></div>';
      html += '<div class="divide-y divide-slate-100">';

      usar.forEach(function (r, idx) {
        var p = r.puesto;
        var pct = Math.max(8, Math.round((r.total / max) * 100));
        var gente = detalle[r.matchKey] || personasEnPuesto(p.nombre);
        html += '<div class="p-4 hover:bg-slate-50/80">';
        html += '<div class="flex flex-wrap items-start justify-between gap-3">';
        html += '<div class="min-w-0 flex-1">';
        html += '<div class="flex items-center gap-2 mb-1">';
        html += '<span class="text-xs font-bold text-slate-400 w-6">#' + (idx + 1) + '</span>';
        html += '<p class="font-semibold text-slate-800 text-sm">' + (p.nombre || '') + '</p>';
        if (p.localidad) html += '<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">' + p.localidad + '</span>';
        html += '</div>';
        html += '<p class="text-xs text-slate-500 ml-8"><i class="fas fa-location-arrow mr-1"></i>' + (p.direccion || '—') + '</p>';
        // barra proporcional
        html += '<div class="ml-8 mt-2 h-2 rounded-full bg-slate-100 overflow-hidden max-w-md">';
        html += '<div class="h-full rounded-full bg-indigo-500" style="width:' + pct + '%"></div></div>';
        html += '</div>';
        html += '<div class="text-right shrink-0">';
        html += '<p class="text-2xl font-bold text-indigo-600 leading-none">' + r.total + '</p>';
        html += '<p class="text-[10px] text-slate-500 mt-0.5">asignados</p>';
        html += '<div class="flex gap-1 justify-end mt-1 text-[10px] font-bold">';
        html += '<span class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">C ' + r.coordinador + '</span>';
        html += '<span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">L ' + r.lider + '</span>';
        html += '<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">A ' + r.amigo + '</span>';
        html += '</div></div></div>';

        if (gente.length) {
          html += '<div class="mt-2 ml-8 flex flex-wrap gap-1.5">';
          gente.forEach(function (g) {
            var col = g.rol === 'Coordinador' ? 'bg-indigo-100 text-indigo-800' : (g.rol === 'Líder' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800');
            html += '<span class="text-[10px] px-2 py-0.5 rounded-full ' + col + '">' + g.rol + ': ' + g.nombre + (g.mesa ? ' · Mesa ' + g.mesa : '') + '</span>';
          });
          html += '</div>';
        }
        html += '</div>';
      });

      html += '</div></div>';
      box.innerHTML = html;
    }

    function renderEstructura(box) {
      var personas = personasConPuesto();
      if (filtroLoc) {
        personas = personas.filter(function (p) { return p.localidad === filtroLoc; });
      }
      if (filtroTexto) {
        var q = norm(filtroTexto);
        personas = personas.filter(function (p) {
          return norm(p.nombre).indexOf(q) >= 0 ||
            norm(p.puesto).indexOf(q) >= 0 ||
            norm(p.cedula).indexOf(q) >= 0 ||
            norm(p.barrio).indexOf(q) >= 0;
        });
      }
      if (!personas.length) {
        box.innerHTML = '<div class="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200"><p>No hay personas en Estructura con ese filtro</p></div>';
        return;
      }
      // Agrupar por localidad → rol
      var byLoc = {};
      personas.forEach(function (p) {
        var loc = p.localidad || 'Sin localidad';
        if (!byLoc[loc]) byLoc[loc] = { Coordinador: [], 'Líder': [], Amigo: [] };
        (byLoc[loc][p.rol] || byLoc[loc].Amigo).push(p);
      });
      var html = '';
      var order = LOCALIDADES.concat(['Sin localidad']);
      order.forEach(function (loc) {
        var g = byLoc[loc];
        if (!g) return;
        var total = g.Coordinador.length + g['Líder'].length + g.Amigo.length;
        if (!total) return;
        html += '<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-3">';
        html += '<div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between"><h3 class="font-bold text-sm text-slate-800">' + loc + '</h3>';
        html += '<span class="text-xs text-slate-500">' + total + ' personas</span></div>';
        html += '<div class="p-4 space-y-4">';
        ['Coordinador', 'Líder', 'Amigo'].forEach(function (rol) {
          var arr = g[rol] || [];
          if (!arr.length) return;
          html += '<div><p class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">' + rol + 's (' + arr.length + ')</p>';
          html += '<div class="space-y-2">';
          arr.forEach(function (p) {
            html += '<div class="flex flex-wrap justify-between gap-2 text-sm border border-slate-100 rounded-xl px-3 py-2">';
            html += '<div><span class="font-medium text-slate-800">' + p.nombre + '</span>';
            html += '<span class="text-xs text-slate-400 ml-2">' + (p.cedula || '') + '</span>';
            if (p.barrio) html += '<p class="text-[11px] text-slate-500">' + p.barrio + '</p>';
            html += '</div>';
            html += '<div class="text-right text-xs">';
            if (p.puesto) html += '<p class="font-semibold text-indigo-700"><i class="fas fa-school mr-1"></i>' + p.puesto + '</p>';
            else html += '<p class="text-amber-600">Sin puesto</p>';
            if (p.mesa) html += '<p class="text-slate-500">Mesa ' + p.mesa + '</p>';
            html += '</div></div>';
          });
          html += '</div></div>';
        });
        html += '</div></div>';
      });
      box.innerHTML = html || '<p class="text-slate-400 text-center py-8">Sin datos</p>';
    }

    function bindUI() {
      var root = document.getElementById('modulo-infovotante');
      if (!root) return;

      // Toggle filtros
      var btn = document.getElementById('iv-filtro-toggle');
      var panel = document.getElementById('iv-filtros-panel');
      var chev = document.getElementById('iv-filtro-chevron');
      var limpiar = document.getElementById('iv-filtro-limpiar');
      var loc = document.getElementById('iv-filtro-loc');
      var txt = document.getElementById('iv-filtro-texto');

      if (btn && panel) {
        btn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          var abierto = !panel.classList.contains('hidden');
          if (abierto) {
            panel.classList.add('hidden');
            panel.style.display = 'none';
            if (chev) chev.style.transform = '';
            if (limpiar) limpiar.classList.add('hidden');
            btn.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
          } else {
            panel.classList.remove('hidden');
            panel.style.display = 'block';
            if (chev) chev.style.transform = 'rotate(180deg)';
            if (limpiar) limpiar.classList.remove('hidden');
            btn.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
          }
        };
      }

      if (loc) {
        loc.onchange = function () {
          filtroLoc = loc.value || '';
          console.log('[InfoVotante] Filtro localidad:', filtroLoc);
          render();
        };
      }
      if (txt) {
        txt.oninput = function () {
          filtroTexto = txt.value || '';
          render();
        };
      }
      if (limpiar) {
        limpiar.onclick = function (e) {
          e.preventDefault();
          filtroLoc = '';
          filtroTexto = '';
          if (loc) loc.value = '';
          if (txt) txt.value = '';
          render();
        };
      }
    }

    // Hook cambiarModulo
    var orig = global.cambiarModulo;
    if (typeof orig === 'function' && !orig._ivHooked) {
      global.cambiarModulo = function (id) {
        if (id === 'mapa') id = 'infovotante';
        orig(id);
        if (id === 'infovotante') {
          inyectarUI();
          render();
        }
      };
      global.cambiarModulo._ivHooked = true;
    }

    return {
      init: function () {
        uiInyectada = false; // permitir rellenar si quedó el placeholder
        inyectarUI();
        render();
      }
    };
  }

  global.App = global.App || {};
  global.App.InfoVotante = { create: createInfoVotante };

  function boot() {
    global.App.instance = global.App.instance || {};
    if (!global.App.instance.infoVotante) {
      var inst = createInfoVotante();
      global.App.instance.infoVotante = inst;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(function () { inst.init(); }, 50); });
      } else {
        setTimeout(function () { inst.init(); }, 50);
      }
    }
  }
  boot();
})(typeof window !== 'undefined' ? window : globalThis);
