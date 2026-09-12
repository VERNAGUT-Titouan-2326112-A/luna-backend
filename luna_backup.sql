--
-- PostgreSQL database dump
--

\restrict Q8SCDBBcpbTzbOj5VWNuQoqMxlh5U7bm7pGXuPEn7Q8jjb2d9z0ii0CTrq1TBcb

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: daily_tracking; Type: TABLE; Schema: public; Owner: luna
--

CREATE TABLE public.daily_tracking (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tracking_date date NOT NULL,
    period boolean DEFAULT false,
    flow character varying(50),
    mood character varying(50),
    symptoms text[],
    discharge character varying(50),
    sex boolean DEFAULT false,
    medication boolean DEFAULT false,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_tracking OWNER TO luna;

--
-- Name: daily_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: luna
--

CREATE SEQUENCE public.daily_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_tracking_id_seq OWNER TO luna;

--
-- Name: daily_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: luna
--

ALTER SEQUENCE public.daily_tracking_id_seq OWNED BY public.daily_tracking.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: luna
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    birth_date date NOT NULL,
    weight numeric(5,2),
    height numeric(5,2),
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_period_start date,
    cycle_length integer DEFAULT 28,
    period_length integer DEFAULT 5
);


ALTER TABLE public.users OWNER TO luna;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: luna
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO luna;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: luna
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: daily_tracking id; Type: DEFAULT; Schema: public; Owner: luna
--

ALTER TABLE ONLY public.daily_tracking ALTER COLUMN id SET DEFAULT nextval('public.daily_tracking_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: luna
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: daily_tracking; Type: TABLE DATA; Schema: public; Owner: luna
--

COPY public.daily_tracking (id, user_id, tracking_date, period, flow, mood, symptoms, discharge, sex, medication, note, created_at, updated_at) FROM stdin;
1	4	2026-09-10	t	Abondant	Bien	{Fatigue}	Normale	f	f	\N	2026-09-05 13:08:17.479618	2026-09-05 13:08:17.479618
3	4	2026-09-06	t	Léger	Neutre	{Ballonnements,"Maux de tête",Fatigue}	Légères	t	t	\N	2026-09-05 13:11:09.046738	2026-09-05 13:13:30.326315
50	4	2026-09-11	f	\N	Neutre	{}	Abondantes	f	f	\N	2026-09-11 18:51:10.291838	2026-09-11 18:51:45.649287
2	4	2026-09-04	f	\N	\N	{}	\N	f	f	\N	2026-09-05 13:08:22.139362	2026-09-11 20:41:17.429169
6	4	2026-09-07	t	Léger	Bien	{Crampes,Fatigue,"Maux de tête"}	Normales	f	f	Check je change 	2026-09-05 13:13:43.532488	2026-09-05 13:23:34.278536
41	4	2026-09-15	t	Moyen	Neutre	{Ballonnements}	Légères	t	f	\N	2026-09-05 22:19:15.093512	2026-09-05 22:19:15.093512
42	4	2026-09-18	t	Moyen	Neutre	{Ballonnements,"Maux de tête"}	\N	f	f	\N	2026-09-05 22:19:29.15244	2026-09-05 22:21:09.905329
16	4	2026-09-08	t	Moyen	Neutre	{Fatigue,"Maux de tête",Crampes}	Normales	t	t	\N	2026-09-05 13:29:34.269549	2026-09-05 22:30:37.730074
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: luna
--

COPY public.users (id, first_name, last_name, birth_date, weight, height, email, password_hash, created_at, last_period_start, cycle_length, period_length) FROM stdin;
1	Titouan	Vernagut	2005-01-08	68.00	180.00	titouanvernagut@gmail.com	$2b$12$Yy.Jpm.30ASWbdLbSnKT.ePGUwwMS4PHX2sKgSBHOQ/BsWHhKhN9.	2026-09-05 12:09:36.419355	\N	28	5
2	Titouan	Vernagut	2008-01-08	68.00	180.00	titouvernagur@gmail.com	$2b$12$Xco/5Q7WdT2Ht07/PCVEhOzoLibo/T8p/I5G5alwQ6BbjLuOdX.ES	2026-09-05 12:36:27.551847	\N	28	5
3	Admin	Luna	2005-01-08	60.00	170.00	adminluna@gmail.com	$2b$12$Hj/evVCJQ4NGa0HTFSmC9OaVUOghN3TaJAg8bpS7oTmiIlXfI9b1K	2026-09-05 12:39:04.443849	\N	28	5
4	Clarisse	Caplain	2006-12-10	55.00	160.00	caplain.c@gmail.com	$2b$10$T9I0R2Gh3278JzGDdh7MmeAWB9Q/.ZJAT9aZV9ZigmtWnfHdzZf.2	2026-09-05 12:52:00.631658	2026-09-05	28	5
\.


--
-- Name: daily_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: luna
--

SELECT pg_catalog.setval('public.daily_tracking_id_seq', 52, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: luna
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: daily_tracking daily_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: luna
--

ALTER TABLE ONLY public.daily_tracking
    ADD CONSTRAINT daily_tracking_pkey PRIMARY KEY (id);


--
-- Name: daily_tracking daily_tracking_user_id_tracking_date_key; Type: CONSTRAINT; Schema: public; Owner: luna
--

ALTER TABLE ONLY public.daily_tracking
    ADD CONSTRAINT daily_tracking_user_id_tracking_date_key UNIQUE (user_id, tracking_date);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: luna
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: luna
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: daily_tracking daily_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: luna
--

ALTER TABLE ONLY public.daily_tracking
    ADD CONSTRAINT daily_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Q8SCDBBcpbTzbOj5VWNuQoqMxlh5U7bm7pGXuPEn7Q8jjb2d9z0ii0CTrq1TBcb

