--
-- PostgreSQL database dump
--

\restrict Td49NJtjeeirPgh7I3xyvhzxBskZ94IZRCEQYyQib8aMuiQLzSyI7dd5U1ZJIKg

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

-- Started on 2026-11-04 08:46:34

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 33290)
-- Name: autopartes_sur; Type: SCHEMA; Schema: -; Owner: oswaldo
--

CREATE SCHEMA autopartes_sur;


ALTER SCHEMA autopartes_sur OWNER TO oswaldo;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 33292)
-- Name: cliente; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.cliente (
    id_cliente bigint NOT NULL,
    nombre character varying(120) NOT NULL,
    telefono character varying(25),
    correo character varying(150),
    CONSTRAINT ck_cliente_contacto CHECK (((telefono IS NOT NULL) OR (correo IS NOT NULL)))
);


ALTER TABLE autopartes_sur.cliente OWNER TO oswaldo;

--
-- TOC entry 216 (class 1259 OID 33291)
-- Name: cliente_id_cliente_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.cliente ALTER COLUMN id_cliente ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.cliente_id_cliente_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 241 (class 1259 OID 33491)
-- Name: comunicacion_cliente; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.comunicacion_cliente (
    id_comunicacion bigint NOT NULL,
    id_pedido bigint NOT NULL,
    id_empleado bigint NOT NULL,
    fecha_comunicacion timestamp with time zone DEFAULT now() NOT NULL,
    medio character varying(20) NOT NULL,
    resumen text NOT NULL,
    CONSTRAINT ck_comunicacion_medio CHECK (((medio)::text = ANY ((ARRAY['PRESENCIAL'::character varying, 'LLAMADA'::character varying, 'WHATSAPP'::character varying, 'SMS'::character varying, 'CORREO'::character varying])::text[])))
);


ALTER TABLE autopartes_sur.comunicacion_cliente OWNER TO oswaldo;

--
-- TOC entry 240 (class 1259 OID 33490)
-- Name: comunicacion_cliente_id_comunicacion_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.comunicacion_cliente ALTER COLUMN id_comunicacion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.comunicacion_cliente_id_comunicacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 33325)
-- Name: empleado; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.empleado (
    id_empleado bigint NOT NULL,
    nombre character varying(120) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE autopartes_sur.empleado OWNER TO oswaldo;

--
-- TOC entry 224 (class 1259 OID 33324)
-- Name: empleado_id_empleado_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.empleado ALTER COLUMN id_empleado ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.empleado_id_empleado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 239 (class 1259 OID 33470)
-- Name: entrega; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.entrega (
    id_entrega bigint NOT NULL,
    id_pedido bigint NOT NULL,
    id_empleado bigint NOT NULL,
    fecha_entrega timestamp with time zone DEFAULT now() NOT NULL,
    nombre_receptor character varying(120) NOT NULL,
    observaciones text
);


ALTER TABLE autopartes_sur.entrega OWNER TO oswaldo;

--
-- TOC entry 238 (class 1259 OID 33469)
-- Name: entrega_id_entrega_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.entrega ALTER COLUMN id_entrega ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.entrega_id_entrega_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 33398)
-- Name: incidencia; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.incidencia (
    id_incidencia bigint NOT NULL,
    id_recepcion bigint NOT NULL,
    id_empleado_registro bigint NOT NULL,
    tipo character varying(65) NOT NULL,
    detalle text NOT NULL,
    fecha_registro timestamp with time zone DEFAULT now() NOT NULL,
    estado character varying(20) DEFAULT 'ABIERTA'::character varying NOT NULL,
    CONSTRAINT ck_incidencia_estado CHECK (((estado)::text = ANY ((ARRAY['ABIERTA'::character varying, 'EN_SEGUIMIENTO'::character varying, 'RESUELTA'::character varying])::text[])))
);


ALTER TABLE autopartes_sur.incidencia OWNER TO oswaldo;

--
-- TOC entry 232 (class 1259 OID 33397)
-- Name: incidencia_id_incidencia_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.incidencia ALTER COLUMN id_incidencia ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.incidencia_id_incidencia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 33351)
-- Name: pedido; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.pedido (
    id_pedido bigint NOT NULL,
    id_solicitud bigint NOT NULL,
    id_proveedor bigint,
    fecha_pedido timestamp with time zone DEFAULT now() NOT NULL,
    fecha_estimada date,
    estado character varying(25) DEFAULT 'SOLICITADO'::character varying NOT NULL,
    CONSTRAINT ck_pedido_estado CHECK (((estado)::text = ANY ((ARRAY['SOLICITADO'::character varying, 'PENDIENTE_PROVEEDOR'::character varying, 'RECIBIDO'::character varying, 'EN_INCIDENCIA'::character varying, 'ENTREGADO'::character varying, 'CANCELADO'::character varying])::text[])))
);


ALTER TABLE autopartes_sur.pedido OWNER TO oswaldo;

--
-- TOC entry 228 (class 1259 OID 33350)
-- Name: pedido_id_pedido_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.pedido ALTER COLUMN id_pedido ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.pedido_id_pedido_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 33319)
-- Name: proveedor; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.proveedor (
    id_proveedor bigint NOT NULL,
    razon_social character varying(130) NOT NULL,
    telefono character varying(25),
    correo character varying(150)
);


ALTER TABLE autopartes_sur.proveedor OWNER TO oswaldo;

--
-- TOC entry 222 (class 1259 OID 33318)
-- Name: proveedor_id_proveedor_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.proveedor ALTER COLUMN id_proveedor ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.proveedor_id_proveedor_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 33372)
-- Name: recepcion; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.recepcion (
    id_recepcion bigint NOT NULL,
    id_pedido bigint NOT NULL,
    id_refaccion_recibida bigint,
    descripcion_recibida text,
    fecha_recepcion timestamp with time zone DEFAULT now() NOT NULL,
    resultado character varying(12) NOT NULL,
    id_empleado bigint NOT NULL,
    CONSTRAINT ck_recepcion_identificacion CHECK (((id_refaccion_recibida IS NOT NULL) OR (NULLIF(btrim(descripcion_recibida), ''::text) IS NOT NULL))),
    CONSTRAINT ck_recepcion_resultado CHECK (((resultado)::text = ANY ((ARRAY['CORRECTA'::character varying, 'INCORRECTA'::character varying])::text[])))
);


ALTER TABLE autopartes_sur.recepcion OWNER TO oswaldo;

--
-- TOC entry 230 (class 1259 OID 33371)
-- Name: recepcion_id_recepcion_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.recepcion ALTER COLUMN id_recepcion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.recepcion_id_recepcion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 33311)
-- Name: refaccion; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.refaccion (
    id_refaccion bigint NOT NULL,
    codigo character varying(45) NOT NULL,
    descripcion character varying(160) NOT NULL,
    variante character varying(100) NOT NULL
);


ALTER TABLE autopartes_sur.refaccion OWNER TO oswaldo;

--
-- TOC entry 220 (class 1259 OID 33310)
-- Name: refaccion_id_refaccion_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.refaccion ALTER COLUMN id_refaccion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.refaccion_id_refaccion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 33421)
-- Name: respuesta_proveedor; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.respuesta_proveedor (
    id_respuesta bigint NOT NULL,
    id_incidencia bigint NOT NULL,
    id_proveedor bigint NOT NULL,
    id_empleado_registro bigint,
    propuesta text NOT NULL,
    fecha_respuesta timestamp with time zone DEFAULT now() NOT NULL,
    fecha_compromiso date
);


ALTER TABLE autopartes_sur.respuesta_proveedor OWNER TO oswaldo;

--
-- TOC entry 234 (class 1259 OID 33420)
-- Name: respuesta_proveedor_id_respuesta_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.respuesta_proveedor ALTER COLUMN id_respuesta ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.respuesta_proveedor_id_respuesta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 33445)
-- Name: seguimiento_incidencia; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.seguimiento_incidencia (
    id_seguimiento bigint NOT NULL,
    id_incidencia bigint NOT NULL,
    id_empleado bigint,
    id_proveedor bigint,
    fecha_accion timestamp with time zone DEFAULT now() NOT NULL,
    accion text NOT NULL,
    CONSTRAINT ck_seguimiento_al_menos_un_actor CHECK (((id_empleado IS NOT NULL) OR (id_proveedor IS NOT NULL)))
);


ALTER TABLE autopartes_sur.seguimiento_incidencia OWNER TO oswaldo;

--
-- TOC entry 236 (class 1259 OID 33444)
-- Name: seguimiento_incidencia_id_seguimiento_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.seguimiento_incidencia ALTER COLUMN id_seguimiento ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.seguimiento_incidencia_id_seguimiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 33332)
-- Name: solicitud; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.solicitud (
    id_solicitud bigint NOT NULL,
    id_vehiculo bigint NOT NULL,
    id_refaccion bigint NOT NULL,
    fecha_solicitud timestamp with time zone DEFAULT now() NOT NULL,
    observaciones text
);


ALTER TABLE autopartes_sur.solicitud OWNER TO oswaldo;

--
-- TOC entry 226 (class 1259 OID 33331)
-- Name: solicitud_id_solicitud_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.solicitud ALTER COLUMN id_solicitud ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.solicitud_id_solicitud_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 33299)
-- Name: vehiculo; Type: TABLE; Schema: autopartes_sur; Owner: oswaldo
--

CREATE TABLE autopartes_sur.vehiculo (
    id_vehiculo bigint NOT NULL,
    id_cliente bigint NOT NULL,
    marca character varying(65) NOT NULL,
    modelo character varying(65) NOT NULL,
    anio smallint NOT NULL,
    motor character varying(80) NOT NULL,
    version character varying(80) NOT NULL,
    CONSTRAINT vehiculo_anio_check CHECK (((anio >= 1950) AND (anio <= 2100)))
);


ALTER TABLE autopartes_sur.vehiculo OWNER TO oswaldo;

--
-- TOC entry 218 (class 1259 OID 33298)
-- Name: vehiculo_id_vehiculo_seq; Type: SEQUENCE; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE autopartes_sur.vehiculo ALTER COLUMN id_vehiculo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME autopartes_sur.vehiculo_id_vehiculo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 242 (class 1259 OID 33526)
-- Name: vista_estado_pedido; Type: VIEW; Schema: autopartes_sur; Owner: oswaldo
--

CREATE VIEW autopartes_sur.vista_estado_pedido AS
 SELECT p.id_pedido,
    v.id_cliente,
    p.estado,
    p.fecha_estimada,
    i.tipo AS tipo_incidencia_abierta,
    i.estado AS estado_incidencia_abierta,
    e.fecha_entrega
   FROM ((((autopartes_sur.pedido p
     JOIN autopartes_sur.solicitud s ON ((s.id_solicitud = p.id_solicitud)))
     JOIN autopartes_sur.vehiculo v ON ((v.id_vehiculo = s.id_vehiculo)))
     LEFT JOIN LATERAL ( SELECT i2.tipo,
            i2.estado
           FROM (autopartes_sur.incidencia i2
             JOIN autopartes_sur.recepcion r2 ON ((r2.id_recepcion = i2.id_recepcion)))
          WHERE ((r2.id_pedido = p.id_pedido) AND ((i2.estado)::text <> 'RESUELTA'::text))
          ORDER BY i2.fecha_registro DESC, i2.id_incidencia DESC
         LIMIT 1) i ON (true))
     LEFT JOIN autopartes_sur.entrega e ON ((e.id_pedido = p.id_pedido)));


ALTER VIEW autopartes_sur.vista_estado_pedido OWNER TO oswaldo;

--
-- TOC entry 5034 (class 0 OID 33292)
-- Dependencies: 217
-- Data for Name: cliente; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.cliente (id_cliente, nombre, telefono, correo) FROM stdin;
1	Ruben Salvador Vazquez	7341599097	rubenelpro_999@hotmail.com
\.


--
-- TOC entry 5058 (class 0 OID 33491)
-- Dependencies: 241
-- Data for Name: comunicacion_cliente; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.comunicacion_cliente (id_comunicacion, id_pedido, id_empleado, fecha_comunicacion, medio, resumen) FROM stdin;
1	7	1	2026-11-03 08:03:00-06	LLAMADA	Todo bien, pero el que me atendio es gay
\.


--
-- TOC entry 5042 (class 0 OID 33325)
-- Dependencies: 225
-- Data for Name: empleado; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.empleado (id_empleado, nombre, activo) FROM stdin;
2	Guadarrama Benitez Oswaldo	t
1	Betanzos Garcia Esau	t
\.


--
-- TOC entry 5056 (class 0 OID 33470)
-- Dependencies: 239
-- Data for Name: entrega; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.entrega (id_entrega, id_pedido, id_empleado, fecha_entrega, nombre_receptor, observaciones) FROM stdin;
1	7	2	2026-11-03 08:03:00-06	Olivares Gabriel	Taba raro el cliente
\.


--
-- TOC entry 5050 (class 0 OID 33398)
-- Dependencies: 233
-- Data for Name: incidencia; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.incidencia (id_incidencia, id_recepcion, id_empleado_registro, tipo, detalle, fecha_registro, estado) FROM stdin;
1	2	2	Pieza dañada	csa	2026-11-03 08:04:00-06	ABIERTA
\.


--
-- TOC entry 5046 (class 0 OID 33351)
-- Dependencies: 229
-- Data for Name: pedido; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.pedido (id_pedido, id_solicitud, id_proveedor, fecha_pedido, fecha_estimada, estado) FROM stdin;
7	1	1	2026-11-02 00:00:00-06	2026-11-26	SOLICITADO
\.


--
-- TOC entry 5040 (class 0 OID 33319)
-- Dependencies: 223
-- Data for Name: proveedor; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.proveedor (id_proveedor, razon_social, telefono, correo) FROM stdin;
1	Juarez c.v.	7352346589	ref_reales@gmail.com
\.


--
-- TOC entry 5048 (class 0 OID 33372)
-- Dependencies: 231
-- Data for Name: recepcion; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.recepcion (id_recepcion, id_pedido, id_refaccion_recibida, descripcion_recibida, fecha_recepcion, resultado, id_empleado) FROM stdin;
2	7	1	xd	2026-11-03 08:02:00-06	CORRECTA	2
\.


--
-- TOC entry 5038 (class 0 OID 33311)
-- Dependencies: 221
-- Data for Name: refaccion; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.refaccion (id_refaccion, codigo, descripcion, variante) FROM stdin;
1	0001	Pieza de Prueba	Cigueñal
2	0002	x	Prueba2
4	0003	x	Prueba2
\.


--
-- TOC entry 5052 (class 0 OID 33421)
-- Dependencies: 235
-- Data for Name: respuesta_proveedor; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.respuesta_proveedor (id_respuesta, id_incidencia, id_proveedor, id_empleado_registro, propuesta, fecha_respuesta, fecha_compromiso) FROM stdin;
1	1	1	2	Cambiar al empleado gay	2026-11-03 00:00:00-06	2026-11-18
\.


--
-- TOC entry 5054 (class 0 OID 33445)
-- Dependencies: 237
-- Data for Name: seguimiento_incidencia; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.seguimiento_incidencia (id_seguimiento, id_incidencia, id_empleado, id_proveedor, fecha_accion, accion) FROM stdin;
9	1	1	1	2026-11-03 08:25:00-06	xd
\.


--
-- TOC entry 5044 (class 0 OID 33332)
-- Dependencies: 227
-- Data for Name: solicitud; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.solicitud (id_solicitud, id_vehiculo, id_refaccion, fecha_solicitud, observaciones) FROM stdin;
1	1	1	2026-11-03 00:00:00-06	Nose
\.


--
-- TOC entry 5036 (class 0 OID 33299)
-- Dependencies: 219
-- Data for Name: vehiculo; Type: TABLE DATA; Schema: autopartes_sur; Owner: oswaldo
--

COPY autopartes_sur.vehiculo (id_vehiculo, id_cliente, marca, modelo, anio, motor, version) FROM stdin;
1	1	Toyota	Tacoma	1995	4.0	Premium
\.


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 216
-- Name: cliente_id_cliente_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.cliente_id_cliente_seq', 2, true);


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 240
-- Name: comunicacion_cliente_id_comunicacion_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.comunicacion_cliente_id_comunicacion_seq', 1, true);


--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 224
-- Name: empleado_id_empleado_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.empleado_id_empleado_seq', 2, true);


--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 238
-- Name: entrega_id_entrega_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.entrega_id_entrega_seq', 1, true);


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 232
-- Name: incidencia_id_incidencia_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.incidencia_id_incidencia_seq', 1, true);


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 228
-- Name: pedido_id_pedido_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.pedido_id_pedido_seq', 7, true);


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 222
-- Name: proveedor_id_proveedor_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.proveedor_id_proveedor_seq', 1, true);


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 230
-- Name: recepcion_id_recepcion_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.recepcion_id_recepcion_seq', 2, true);


--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 220
-- Name: refaccion_id_refaccion_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.refaccion_id_refaccion_seq', 4, true);


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 234
-- Name: respuesta_proveedor_id_respuesta_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.respuesta_proveedor_id_respuesta_seq', 1, true);


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 236
-- Name: seguimiento_incidencia_id_seguimiento_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.seguimiento_incidencia_id_seguimiento_seq', 9, true);


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 226
-- Name: solicitud_id_solicitud_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.solicitud_id_solicitud_seq', 1, true);


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 218
-- Name: vehiculo_id_vehiculo_seq; Type: SEQUENCE SET; Schema: autopartes_sur; Owner: oswaldo
--

SELECT pg_catalog.setval('autopartes_sur.vehiculo_id_vehiculo_seq', 1, true);


--
-- TOC entry 4820 (class 2606 OID 33297)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente);


--
-- TOC entry 4866 (class 2606 OID 33499)
-- Name: comunicacion_cliente comunicacion_cliente_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.comunicacion_cliente
    ADD CONSTRAINT comunicacion_cliente_pkey PRIMARY KEY (id_comunicacion);


--
-- TOC entry 4831 (class 2606 OID 33330)
-- Name: empleado empleado_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.empleado
    ADD CONSTRAINT empleado_pkey PRIMARY KEY (id_empleado);


--
-- TOC entry 4861 (class 2606 OID 33479)
-- Name: entrega entrega_id_pedido_key; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.entrega
    ADD CONSTRAINT entrega_id_pedido_key UNIQUE (id_pedido);


--
-- TOC entry 4863 (class 2606 OID 33477)
-- Name: entrega entrega_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.entrega
    ADD CONSTRAINT entrega_pkey PRIMARY KEY (id_entrega);


--
-- TOC entry 4847 (class 2606 OID 33409)
-- Name: incidencia incidencia_id_recepcion_key; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.incidencia
    ADD CONSTRAINT incidencia_id_recepcion_key UNIQUE (id_recepcion);


--
-- TOC entry 4849 (class 2606 OID 33407)
-- Name: incidencia incidencia_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.incidencia
    ADD CONSTRAINT incidencia_pkey PRIMARY KEY (id_incidencia);


--
-- TOC entry 4838 (class 2606 OID 33360)
-- Name: pedido pedido_id_solicitud_key; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.pedido
    ADD CONSTRAINT pedido_id_solicitud_key UNIQUE (id_solicitud);


--
-- TOC entry 4840 (class 2606 OID 33358)
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id_pedido);


--
-- TOC entry 4829 (class 2606 OID 33323)
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor);


--
-- TOC entry 4845 (class 2606 OID 33381)
-- Name: recepcion recepcion_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.recepcion
    ADD CONSTRAINT recepcion_pkey PRIMARY KEY (id_recepcion);


--
-- TOC entry 4825 (class 2606 OID 33315)
-- Name: refaccion refaccion_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.refaccion
    ADD CONSTRAINT refaccion_pkey PRIMARY KEY (id_refaccion);


--
-- TOC entry 4854 (class 2606 OID 33428)
-- Name: respuesta_proveedor respuesta_proveedor_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.respuesta_proveedor
    ADD CONSTRAINT respuesta_proveedor_pkey PRIMARY KEY (id_respuesta);


--
-- TOC entry 4859 (class 2606 OID 33453)
-- Name: seguimiento_incidencia seguimiento_incidencia_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.seguimiento_incidencia
    ADD CONSTRAINT seguimiento_incidencia_pkey PRIMARY KEY (id_seguimiento);


--
-- TOC entry 4835 (class 2606 OID 33339)
-- Name: solicitud solicitud_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.solicitud
    ADD CONSTRAINT solicitud_pkey PRIMARY KEY (id_solicitud);


--
-- TOC entry 4827 (class 2606 OID 33317)
-- Name: refaccion uq_refaccion_codigo_variante; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.refaccion
    ADD CONSTRAINT uq_refaccion_codigo_variante UNIQUE (codigo, variante);


--
-- TOC entry 4823 (class 2606 OID 33304)
-- Name: vehiculo vehiculo_pkey; Type: CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.vehiculo
    ADD CONSTRAINT vehiculo_pkey PRIMARY KEY (id_vehiculo);


--
-- TOC entry 4867 (class 1259 OID 33525)
-- Name: ix_comunicacion_cliente_id_empleado; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_comunicacion_cliente_id_empleado ON autopartes_sur.comunicacion_cliente USING btree (id_empleado);


--
-- TOC entry 4868 (class 1259 OID 33524)
-- Name: ix_comunicacion_cliente_id_pedido; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_comunicacion_cliente_id_pedido ON autopartes_sur.comunicacion_cliente USING btree (id_pedido);


--
-- TOC entry 4864 (class 1259 OID 33523)
-- Name: ix_entrega_id_empleado; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_entrega_id_empleado ON autopartes_sur.entrega USING btree (id_empleado);


--
-- TOC entry 4850 (class 1259 OID 33517)
-- Name: ix_incidencia_id_empleado_registro; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_incidencia_id_empleado_registro ON autopartes_sur.incidencia USING btree (id_empleado_registro);


--
-- TOC entry 4836 (class 1259 OID 33513)
-- Name: ix_pedido_id_proveedor; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_pedido_id_proveedor ON autopartes_sur.pedido USING btree (id_proveedor);


--
-- TOC entry 4841 (class 1259 OID 33516)
-- Name: ix_recepcion_id_empleado; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_recepcion_id_empleado ON autopartes_sur.recepcion USING btree (id_empleado);


--
-- TOC entry 4842 (class 1259 OID 33514)
-- Name: ix_recepcion_id_pedido; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_recepcion_id_pedido ON autopartes_sur.recepcion USING btree (id_pedido);


--
-- TOC entry 4843 (class 1259 OID 33515)
-- Name: ix_recepcion_id_refaccion_recibida; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_recepcion_id_refaccion_recibida ON autopartes_sur.recepcion USING btree (id_refaccion_recibida);


--
-- TOC entry 4851 (class 1259 OID 33518)
-- Name: ix_respuesta_proveedor_id_incidencia; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_respuesta_proveedor_id_incidencia ON autopartes_sur.respuesta_proveedor USING btree (id_incidencia);


--
-- TOC entry 4852 (class 1259 OID 33519)
-- Name: ix_respuesta_proveedor_id_proveedor; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_respuesta_proveedor_id_proveedor ON autopartes_sur.respuesta_proveedor USING btree (id_proveedor);


--
-- TOC entry 4855 (class 1259 OID 33521)
-- Name: ix_seguimiento_incidencia_id_empleado; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_seguimiento_incidencia_id_empleado ON autopartes_sur.seguimiento_incidencia USING btree (id_empleado);


--
-- TOC entry 4856 (class 1259 OID 33520)
-- Name: ix_seguimiento_incidencia_id_incidencia; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_seguimiento_incidencia_id_incidencia ON autopartes_sur.seguimiento_incidencia USING btree (id_incidencia);


--
-- TOC entry 4857 (class 1259 OID 33522)
-- Name: ix_seguimiento_incidencia_id_proveedor; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_seguimiento_incidencia_id_proveedor ON autopartes_sur.seguimiento_incidencia USING btree (id_proveedor);


--
-- TOC entry 4832 (class 1259 OID 33512)
-- Name: ix_solicitud_id_refaccion; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_solicitud_id_refaccion ON autopartes_sur.solicitud USING btree (id_refaccion);


--
-- TOC entry 4833 (class 1259 OID 33511)
-- Name: ix_solicitud_id_vehiculo; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_solicitud_id_vehiculo ON autopartes_sur.solicitud USING btree (id_vehiculo);


--
-- TOC entry 4821 (class 1259 OID 33510)
-- Name: ix_vehiculo_id_cliente; Type: INDEX; Schema: autopartes_sur; Owner: oswaldo
--

CREATE INDEX ix_vehiculo_id_cliente ON autopartes_sur.vehiculo USING btree (id_cliente);


--
-- TOC entry 4887 (class 2606 OID 33505)
-- Name: comunicacion_cliente comunicacion_cliente_id_empleado_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.comunicacion_cliente
    ADD CONSTRAINT comunicacion_cliente_id_empleado_fkey FOREIGN KEY (id_empleado) REFERENCES autopartes_sur.empleado(id_empleado) ON DELETE RESTRICT;


--
-- TOC entry 4888 (class 2606 OID 33500)
-- Name: comunicacion_cliente comunicacion_cliente_id_pedido_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.comunicacion_cliente
    ADD CONSTRAINT comunicacion_cliente_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES autopartes_sur.pedido(id_pedido) ON DELETE RESTRICT;


--
-- TOC entry 4885 (class 2606 OID 33485)
-- Name: entrega entrega_id_empleado_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.entrega
    ADD CONSTRAINT entrega_id_empleado_fkey FOREIGN KEY (id_empleado) REFERENCES autopartes_sur.empleado(id_empleado) ON DELETE RESTRICT;


--
-- TOC entry 4886 (class 2606 OID 33480)
-- Name: entrega entrega_id_pedido_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.entrega
    ADD CONSTRAINT entrega_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES autopartes_sur.pedido(id_pedido) ON DELETE RESTRICT;


--
-- TOC entry 4877 (class 2606 OID 33415)
-- Name: incidencia incidencia_id_empleado_registro_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.incidencia
    ADD CONSTRAINT incidencia_id_empleado_registro_fkey FOREIGN KEY (id_empleado_registro) REFERENCES autopartes_sur.empleado(id_empleado) ON DELETE RESTRICT;


--
-- TOC entry 4878 (class 2606 OID 33410)
-- Name: incidencia incidencia_id_recepcion_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.incidencia
    ADD CONSTRAINT incidencia_id_recepcion_fkey FOREIGN KEY (id_recepcion) REFERENCES autopartes_sur.recepcion(id_recepcion) ON DELETE RESTRICT;


--
-- TOC entry 4872 (class 2606 OID 33366)
-- Name: pedido pedido_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.pedido
    ADD CONSTRAINT pedido_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES autopartes_sur.proveedor(id_proveedor) ON DELETE RESTRICT;


--
-- TOC entry 4873 (class 2606 OID 33361)
-- Name: pedido pedido_id_solicitud_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.pedido
    ADD CONSTRAINT pedido_id_solicitud_fkey FOREIGN KEY (id_solicitud) REFERENCES autopartes_sur.solicitud(id_solicitud) ON DELETE RESTRICT;


--
-- TOC entry 4874 (class 2606 OID 33392)
-- Name: recepcion recepcion_id_empleado_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.recepcion
    ADD CONSTRAINT recepcion_id_empleado_fkey FOREIGN KEY (id_empleado) REFERENCES autopartes_sur.empleado(id_empleado) ON DELETE RESTRICT;


--
-- TOC entry 4875 (class 2606 OID 33382)
-- Name: recepcion recepcion_id_pedido_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.recepcion
    ADD CONSTRAINT recepcion_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES autopartes_sur.pedido(id_pedido) ON DELETE RESTRICT;


--
-- TOC entry 4876 (class 2606 OID 33387)
-- Name: recepcion recepcion_id_refaccion_recibida_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.recepcion
    ADD CONSTRAINT recepcion_id_refaccion_recibida_fkey FOREIGN KEY (id_refaccion_recibida) REFERENCES autopartes_sur.refaccion(id_refaccion) ON DELETE RESTRICT;


--
-- TOC entry 4879 (class 2606 OID 33439)
-- Name: respuesta_proveedor respuesta_proveedor_id_empleado_registro_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.respuesta_proveedor
    ADD CONSTRAINT respuesta_proveedor_id_empleado_registro_fkey FOREIGN KEY (id_empleado_registro) REFERENCES autopartes_sur.empleado(id_empleado) ON DELETE RESTRICT;


--
-- TOC entry 4880 (class 2606 OID 33429)
-- Name: respuesta_proveedor respuesta_proveedor_id_incidencia_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.respuesta_proveedor
    ADD CONSTRAINT respuesta_proveedor_id_incidencia_fkey FOREIGN KEY (id_incidencia) REFERENCES autopartes_sur.incidencia(id_incidencia) ON DELETE RESTRICT;


--
-- TOC entry 4881 (class 2606 OID 33434)
-- Name: respuesta_proveedor respuesta_proveedor_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.respuesta_proveedor
    ADD CONSTRAINT respuesta_proveedor_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES autopartes_sur.proveedor(id_proveedor) ON DELETE RESTRICT;


--
-- TOC entry 4882 (class 2606 OID 33459)
-- Name: seguimiento_incidencia seguimiento_incidencia_id_empleado_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.seguimiento_incidencia
    ADD CONSTRAINT seguimiento_incidencia_id_empleado_fkey FOREIGN KEY (id_empleado) REFERENCES autopartes_sur.empleado(id_empleado) ON DELETE RESTRICT;


--
-- TOC entry 4883 (class 2606 OID 33454)
-- Name: seguimiento_incidencia seguimiento_incidencia_id_incidencia_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.seguimiento_incidencia
    ADD CONSTRAINT seguimiento_incidencia_id_incidencia_fkey FOREIGN KEY (id_incidencia) REFERENCES autopartes_sur.incidencia(id_incidencia) ON DELETE RESTRICT;


--
-- TOC entry 4884 (class 2606 OID 33464)
-- Name: seguimiento_incidencia seguimiento_incidencia_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.seguimiento_incidencia
    ADD CONSTRAINT seguimiento_incidencia_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES autopartes_sur.proveedor(id_proveedor) ON DELETE RESTRICT;


--
-- TOC entry 4870 (class 2606 OID 33345)
-- Name: solicitud solicitud_id_refaccion_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.solicitud
    ADD CONSTRAINT solicitud_id_refaccion_fkey FOREIGN KEY (id_refaccion) REFERENCES autopartes_sur.refaccion(id_refaccion) ON DELETE RESTRICT;


--
-- TOC entry 4871 (class 2606 OID 33340)
-- Name: solicitud solicitud_id_vehiculo_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.solicitud
    ADD CONSTRAINT solicitud_id_vehiculo_fkey FOREIGN KEY (id_vehiculo) REFERENCES autopartes_sur.vehiculo(id_vehiculo) ON DELETE RESTRICT;


--
-- TOC entry 4869 (class 2606 OID 33305)
-- Name: vehiculo vehiculo_id_cliente_fkey; Type: FK CONSTRAINT; Schema: autopartes_sur; Owner: oswaldo
--

ALTER TABLE ONLY autopartes_sur.vehiculo
    ADD CONSTRAINT vehiculo_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES autopartes_sur.cliente(id_cliente) ON DELETE RESTRICT;


-- Completed on 2026-11-04 08:46:34

--
-- PostgreSQL database dump complete
--

\unrestrict Td49NJtjeeirPgh7I3xyvhzxBskZ94IZRCEQYyQib8aMuiQLzSyI7dd5U1ZJIKg

