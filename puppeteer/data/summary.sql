CREATE TABLE summary (
    id character varying(6) primary key,
    name character varying(10),
    addr character varying(6),
    type integer,
    ipo timestamp(6) without time zone,
    exchange character varying(4),      -- sz, sh
    grade character varying(1),         -- A-D
    level integer,                      -- 0-9, market value
    status integer
);
