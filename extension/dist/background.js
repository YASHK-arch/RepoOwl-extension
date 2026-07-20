//#region ../node_modules/tslib/tslib.es6.mjs
function e(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function t(e, t, n, r) {
	function i(e) {
		return e instanceof n ? e : new n(function(t) {
			t(e);
		});
	}
	return new (n ||= Promise)(function(n, a) {
		function o(e) {
			try {
				c(r.next(e));
			} catch (e) {
				a(e);
			}
		}
		function s(e) {
			try {
				c(r.throw(e));
			} catch (e) {
				a(e);
			}
		}
		function c(e) {
			e.done ? n(e.value) : i(e.value).then(o, s);
		}
		c((r = r.apply(e, t || [])).next());
	});
}
//#endregion
//#region ../node_modules/@supabase/functions-js/dist/module/helper.js
var n = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), r = class extends Error {
	constructor(e, t = "FunctionsError", n) {
		super(e), this.name = t, this.context = n;
	}
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			context: this.context
		};
	}
}, i = class extends r {
	constructor(e) {
		super("Failed to send a request to the Edge Function", "FunctionsFetchError", e);
	}
}, a = class extends r {
	constructor(e) {
		super("Relay Error invoking the Edge Function", "FunctionsRelayError", e);
	}
}, o = class extends r {
	constructor(e) {
		super("Edge Function returned a non-2xx status code", "FunctionsHttpError", e);
	}
}, s;
(function(e) {
	e.Any = "any", e.ApNortheast1 = "ap-northeast-1", e.ApNortheast2 = "ap-northeast-2", e.ApSouth1 = "ap-south-1", e.ApSoutheast1 = "ap-southeast-1", e.ApSoutheast2 = "ap-southeast-2", e.CaCentral1 = "ca-central-1", e.EuCentral1 = "eu-central-1", e.EuWest1 = "eu-west-1", e.EuWest2 = "eu-west-2", e.EuWest3 = "eu-west-3", e.SaEast1 = "sa-east-1", e.UsEast1 = "us-east-1", e.UsWest1 = "us-west-1", e.UsWest2 = "us-west-2";
})(s ||= {});
//#endregion
//#region ../node_modules/@supabase/functions-js/dist/module/FunctionsClient.js
var c = class {
	constructor(e, { headers: t = {}, customFetch: r, region: i = s.Any } = {}) {
		this.url = e, this.headers = t, this.region = i, this.fetch = n(r);
	}
	setAuth(e) {
		this.headers.Authorization = `Bearer ${e}`;
	}
	invoke(e) {
		return t(this, arguments, void 0, function* (e, t = {}) {
			let n, r;
			try {
				let { headers: s, method: c, body: l, signal: u, timeout: d } = t, f = {}, { region: p } = t;
				p ||= this.region;
				let m = new URL(`${this.url}/${e}`);
				p && p !== "any" && (f["x-region"] = p, m.searchParams.set("forceFunctionRegion", p));
				let h, ee = !!s && Object.keys(s).some((e) => e.toLowerCase() === "content-type");
				l && !ee ? typeof Blob < "u" && l instanceof Blob || l instanceof ArrayBuffer ? (f["Content-Type"] = "application/octet-stream", h = l) : typeof l == "string" ? (f["Content-Type"] = "text/plain", h = l) : typeof FormData < "u" && l instanceof FormData ? h = l : (f["Content-Type"] = "application/json", h = JSON.stringify(l)) : h = l && typeof l != "string" && !(typeof Blob < "u" && l instanceof Blob) && !(l instanceof ArrayBuffer) && !(typeof FormData < "u" && l instanceof FormData) ? JSON.stringify(l) : l;
				let te = u;
				d && (r = new AbortController(), n = setTimeout(() => r.abort(), d), u ? (te = r.signal, u.addEventListener("abort", () => r.abort())) : te = r.signal);
				let g = yield this.fetch(m.toString(), {
					method: c || "POST",
					headers: Object.assign(Object.assign(Object.assign({}, f), this.headers), s),
					body: h,
					signal: te
				}).catch((e) => {
					throw new i(e);
				}), _ = g.headers.get("x-relay-error");
				if (_ && _ === "true") throw new a(g);
				if (!g.ok) throw new o(g);
				let ne = (g.headers.get("Content-Type") ?? "text/plain").split(";")[0].trim(), re;
				return re = ne === "application/json" ? yield g.json() : ne === "application/octet-stream" || ne === "application/pdf" ? yield g.blob() : ne === "text/event-stream" ? g : ne === "multipart/form-data" ? yield g.formData() : yield g.text(), {
					data: re,
					error: null,
					response: g
				};
			} catch (e) {
				return {
					data: null,
					error: e,
					response: e instanceof o || e instanceof a ? e.context : void 0
				};
			} finally {
				n && clearTimeout(n);
			}
		});
	}
}, l = 3, u = (e) => Math.min(1e3 * 2 ** e, 3e4), d = [520, 503], f = [
	"GET",
	"HEAD",
	"OPTIONS"
], p = class extends Error {
	constructor(e) {
		super(e.message), this.name = "PostgrestError", this.details = e.details, this.hint = e.hint, this.code = e.code;
	}
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			details: this.details,
			hint: this.hint,
			code: this.code
		};
	}
};
function m(e, t) {
	return new Promise((n) => {
		if (t?.aborted) {
			n();
			return;
		}
		let r = setTimeout(() => {
			t?.removeEventListener("abort", i), n();
		}, e);
		function i() {
			clearTimeout(r), n();
		}
		t?.addEventListener("abort", i);
	});
}
function h(e, t, n, r) {
	return !(!r || n >= l || !f.includes(e) || !d.includes(t));
}
var ee = class {
	constructor(e) {
		this.shouldThrowOnError = !1, this.retryEnabled = !0, this.method = e.method, this.url = e.url, this.headers = new Headers(e.headers), this.schema = e.schema, this.body = e.body, this.shouldThrowOnError = e.shouldThrowOnError ?? !1, this.signal = e.signal, this.isMaybeSingle = e.isMaybeSingle ?? !1, this.shouldStripNulls = e.shouldStripNulls ?? !1, this.urlLengthLimit = e.urlLengthLimit ?? 8e3, this.retryEnabled = e.retry ?? !0, e.fetch ? this.fetch = e.fetch : this.fetch = fetch;
	}
	throwOnError() {
		return this.shouldThrowOnError = !0, this;
	}
	stripNulls() {
		if (this.headers.get("Accept") === "text/csv") throw Error("stripNulls() cannot be used with csv()");
		return this.shouldStripNulls = !0, this;
	}
	setHeader(e, t) {
		return this.headers = new Headers(this.headers), this.headers.set(e, t), this;
	}
	retry(e) {
		return this.retryEnabled = e, this;
	}
	then(e, t) {
		var n = this;
		if (this.schema === void 0 || (["GET", "HEAD"].includes(this.method) ? this.headers.set("Accept-Profile", this.schema) : this.headers.set("Content-Profile", this.schema)), this.method !== "GET" && this.method !== "HEAD" && this.headers.set("Content-Type", "application/json"), this.shouldStripNulls) {
			let e = this.headers.get("Accept");
			e === "application/vnd.pgrst.object+json" ? this.headers.set("Accept", "application/vnd.pgrst.object+json;nulls=stripped") : (!e || e === "application/json") && this.headers.set("Accept", "application/vnd.pgrst.array+json;nulls=stripped");
		}
		let r = this.fetch, i = (async () => {
			let e = 0;
			for (;;) {
				let t = {};
				n.headers.forEach((e, n) => {
					t[n] = e;
				}), e > 0 && (t["X-Retry-Count"] = String(e));
				let i;
				try {
					i = await r(n.url.toString(), {
						method: n.method,
						headers: t,
						body: JSON.stringify(n.body, (e, t) => typeof t == "bigint" ? t.toString() : t),
						signal: n.signal
					});
				} catch (t) {
					if (t?.name === "AbortError" || t?.code === "ABORT_ERR" || !f.includes(n.method)) throw t;
					if (n.retryEnabled && e < l) {
						let t = u(e);
						e++, await m(t, n.signal);
						continue;
					}
					throw t;
				}
				if (h(n.method, i.status, e, n.retryEnabled)) {
					let t = i.headers?.get("Retry-After") ?? null, r = t === null ? u(e) : Math.max(0, parseInt(t, 10) || 0) * 1e3;
					await i.text(), e++, await m(r, n.signal);
					continue;
				}
				return await n.processResponse(i);
			}
		})();
		return this.shouldThrowOnError || (i = i.catch((e) => {
			let t = "", n = "", r = "", i = e?.cause;
			if (i) {
				let n = i?.message ?? "", r = i?.code ?? "";
				t = `${e?.name ?? "FetchError"}: ${e?.message}`, t += `\n\nCaused by: ${i?.name ?? "Error"}: ${n}`, r && (t += ` (${r})`), i?.stack && (t += `\n${i.stack}`);
			} else t = e?.stack ?? "";
			let a = this.url.toString().length;
			return e?.name === "AbortError" || e?.code === "ABORT_ERR" ? (r = "", n = "Request was aborted (timeout or manual cancellation)", a > this.urlLengthLimit && (n += `. Note: Your request URL is ${a} characters, which may exceed server limits. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [many IDs])), consider using an RPC function to pass values server-side.`)) : (i?.name === "HeadersOverflowError" || i?.code === "UND_ERR_HEADERS_OVERFLOW") && (r = "", n = "HTTP headers exceeded server limits (typically 16KB)", a > this.urlLengthLimit && (n += `. Your request URL is ${a} characters. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [200+ IDs])), consider using an RPC function instead.`)), {
				success: !1,
				error: {
					message: `${e?.name ?? "FetchError"}: ${e?.message}`,
					details: t,
					hint: n,
					code: r
				},
				data: null,
				count: null,
				status: 0,
				statusText: ""
			};
		})), i.then(e, t);
	}
	async processResponse(e) {
		var t = this;
		let n = null, r = null, i = null, a = e.status, o = e.statusText;
		if (e.ok) {
			if (t.method !== "HEAD") {
				let i = await e.text();
				if (i !== "") if (t.headers.get("Accept") === "text/csv") r = i;
				else if (t.headers.get("Accept") && t.headers.get("Accept")?.includes("application/vnd.pgrst.plan+text")) r = i;
				else try {
					r = JSON.parse(i);
				} catch {
					if (n = { message: i }, r = null, t.shouldThrowOnError) throw new p({
						message: i,
						details: "",
						hint: "",
						code: ""
					});
				}
			}
			let s = t.headers.get("Prefer")?.match(/count=(exact|planned|estimated)/), c = e.headers.get("content-range")?.split("/");
			s && c && c.length > 1 && (i = parseInt(c[1])), t.isMaybeSingle && Array.isArray(r) && (r.length > 1 ? (n = {
				code: "PGRST116",
				details: `Results contain ${r.length} rows, application/vnd.pgrst.object+json requires 1 row`,
				hint: null,
				message: "JSON object requested, multiple (or no) rows returned"
			}, r = null, i = null, a = 406, o = "Not Acceptable") : r = r.length === 1 ? r[0] : null);
		} else {
			let i = await e.text();
			try {
				n = JSON.parse(i), Array.isArray(n) && e.status === 404 && (r = [], n = null, a = 200, o = "OK");
			} catch {
				e.status === 404 && i === "" ? (a = 204, o = "No Content") : n = { message: i };
			}
			if (n && t.shouldThrowOnError) throw new p(n);
		}
		return {
			success: n === null,
			error: n,
			data: r,
			count: i,
			status: a,
			statusText: o
		};
	}
	returns() {
		/* istanbul ignore next */
		return this;
	}
	overrideTypes() {
		return this;
	}
}, te = class extends ee {
	throwOnError() {
		return super.throwOnError();
	}
	select(e) {
		let t = !1, n = (e ?? "*").split("").map((e) => /\s/.test(e) && !t ? "" : (e === "\"" && (t = !t), e)).join("");
		return this.url.searchParams.set("select", n), this.headers.append("Prefer", "return=representation"), this;
	}
	order(e, { ascending: t = !0, nullsFirst: n, foreignTable: r, referencedTable: i = r } = {}) {
		let a = i ? `${i}.order` : "order", o = this.url.searchParams.get(a);
		return this.url.searchParams.set(a, `${o ? `${o},` : ""}${e}.${t ? "asc" : "desc"}${n === void 0 ? "" : n ? ".nullsfirst" : ".nullslast"}`), this;
	}
	limit(e, { foreignTable: t, referencedTable: n = t } = {}) {
		let r = n === void 0 ? "limit" : `${n}.limit`;
		return this.url.searchParams.set(r, `${e}`), this;
	}
	range(e, t, { foreignTable: n, referencedTable: r = n } = {}) {
		let i = r === void 0 ? "offset" : `${r}.offset`, a = r === void 0 ? "limit" : `${r}.limit`;
		return this.url.searchParams.set(i, `${e}`), this.url.searchParams.set(a, `${t - e + 1}`), this;
	}
	abortSignal(e) {
		return this.signal = e, this;
	}
	single() {
		return this.headers.set("Accept", "application/vnd.pgrst.object+json"), this;
	}
	maybeSingle() {
		return this.isMaybeSingle = !0, this;
	}
	csv() {
		return this.headers.set("Accept", "text/csv"), this;
	}
	geojson() {
		return this.headers.set("Accept", "application/geo+json"), this;
	}
	explain({ analyze: e = !1, verbose: t = !1, settings: n = !1, buffers: r = !1, wal: i = !1, format: a = "text" } = {}) {
		let o = [
			e ? "analyze" : null,
			t ? "verbose" : null,
			n ? "settings" : null,
			r ? "buffers" : null,
			i ? "wal" : null
		].filter(Boolean).join("|"), s = this.headers.get("Accept") ?? "application/json";
		return this.headers.set("Accept", `application/vnd.pgrst.plan+${a}; for="${s}"; options=${o};`), this;
	}
	rollback() {
		return this.headers.append("Prefer", "tx=rollback"), this;
	}
	returns() {
		return this;
	}
	maxAffected(e) {
		return this.headers.append("Prefer", "handling=strict"), this.headers.append("Prefer", `max-affected=${e}`), this;
	}
}, g = /* @__PURE__ */ RegExp("[,()]"), _ = class extends te {
	throwOnError() {
		return super.throwOnError();
	}
	eq(e, t) {
		return this.url.searchParams.append(e, `eq.${t}`), this;
	}
	neq(e, t) {
		return this.url.searchParams.append(e, `neq.${t}`), this;
	}
	gt(e, t) {
		return this.url.searchParams.append(e, `gt.${t}`), this;
	}
	gte(e, t) {
		return this.url.searchParams.append(e, `gte.${t}`), this;
	}
	lt(e, t) {
		return this.url.searchParams.append(e, `lt.${t}`), this;
	}
	lte(e, t) {
		return this.url.searchParams.append(e, `lte.${t}`), this;
	}
	like(e, t) {
		return this.url.searchParams.append(e, `like.${t}`), this;
	}
	likeAllOf(e, t) {
		return this.url.searchParams.append(e, `like(all).{${t.join(",")}}`), this;
	}
	likeAnyOf(e, t) {
		return this.url.searchParams.append(e, `like(any).{${t.join(",")}}`), this;
	}
	ilike(e, t) {
		return this.url.searchParams.append(e, `ilike.${t}`), this;
	}
	ilikeAllOf(e, t) {
		return this.url.searchParams.append(e, `ilike(all).{${t.join(",")}}`), this;
	}
	ilikeAnyOf(e, t) {
		return this.url.searchParams.append(e, `ilike(any).{${t.join(",")}}`), this;
	}
	regexMatch(e, t) {
		return this.url.searchParams.append(e, `match.${t}`), this;
	}
	regexIMatch(e, t) {
		return this.url.searchParams.append(e, `imatch.${t}`), this;
	}
	is(e, t) {
		return this.url.searchParams.append(e, `is.${t}`), this;
	}
	isDistinct(e, t) {
		return this.url.searchParams.append(e, `isdistinct.${t}`), this;
	}
	in(e, t) {
		let n = Array.from(new Set(t)).map((e) => typeof e == "string" && g.test(e) ? `"${e}"` : `${e}`).join(",");
		return this.url.searchParams.append(e, `in.(${n})`), this;
	}
	notIn(e, t) {
		let n = Array.from(new Set(t)).map((e) => typeof e == "string" && g.test(e) ? `"${e}"` : `${e}`).join(",");
		return this.url.searchParams.append(e, `not.in.(${n})`), this;
	}
	contains(e, t) {
		return typeof t == "string" ? this.url.searchParams.append(e, `cs.${t}`) : Array.isArray(t) ? this.url.searchParams.append(e, `cs.{${t.join(",")}}`) : this.url.searchParams.append(e, `cs.${JSON.stringify(t)}`), this;
	}
	containedBy(e, t) {
		return typeof t == "string" ? this.url.searchParams.append(e, `cd.${t}`) : Array.isArray(t) ? this.url.searchParams.append(e, `cd.{${t.join(",")}}`) : this.url.searchParams.append(e, `cd.${JSON.stringify(t)}`), this;
	}
	rangeGt(e, t) {
		return this.url.searchParams.append(e, `sr.${t}`), this;
	}
	rangeGte(e, t) {
		return this.url.searchParams.append(e, `nxl.${t}`), this;
	}
	rangeLt(e, t) {
		return this.url.searchParams.append(e, `sl.${t}`), this;
	}
	rangeLte(e, t) {
		return this.url.searchParams.append(e, `nxr.${t}`), this;
	}
	rangeAdjacent(e, t) {
		return this.url.searchParams.append(e, `adj.${t}`), this;
	}
	overlaps(e, t) {
		return typeof t == "string" ? this.url.searchParams.append(e, `ov.${t}`) : this.url.searchParams.append(e, `ov.{${t.join(",")}}`), this;
	}
	textSearch(e, t, { config: n, type: r } = {}) {
		let i = "";
		r === "plain" ? i = "pl" : r === "phrase" ? i = "ph" : r === "websearch" && (i = "w");
		let a = n === void 0 ? "" : `(${n})`;
		return this.url.searchParams.append(e, `${i}fts${a}.${t}`), this;
	}
	match(e) {
		return Object.entries(e).filter(([e, t]) => t !== void 0).forEach(([e, t]) => {
			this.url.searchParams.append(e, `eq.${t}`);
		}), this;
	}
	not(e, t, n) {
		return this.url.searchParams.append(e, `not.${t}.${n}`), this;
	}
	or(e, { foreignTable: t, referencedTable: n = t } = {}) {
		let r = n ? `${n}.or` : "or";
		return this.url.searchParams.append(r, `(${e})`), this;
	}
	filter(e, t, n) {
		return this.url.searchParams.append(e, `${t}.${n}`), this;
	}
}, ne = class {
	constructor(e, { headers: t = {}, schema: n, fetch: r, urlLengthLimit: i = 8e3, retry: a }) {
		this.url = e, this.headers = new Headers(t), this.schema = n, this.fetch = r, this.urlLengthLimit = i, this.retry = a;
	}
	cloneRequestState() {
		return {
			url: new URL(this.url.toString()),
			headers: new Headers(this.headers)
		};
	}
	select(e, t) {
		let { head: n = !1, count: r } = t ?? {}, i = n ? "HEAD" : "GET", a = !1, o = (e ?? "*").split("").map((e) => /\s/.test(e) && !a ? "" : (e === "\"" && (a = !a), e)).join(""), { url: s, headers: c } = this.cloneRequestState();
		return s.searchParams.set("select", o), r && c.append("Prefer", `count=${r}`), new _({
			method: i,
			url: s,
			headers: c,
			schema: this.schema,
			fetch: this.fetch,
			urlLengthLimit: this.urlLengthLimit,
			retry: this.retry
		});
	}
	insert(e, { count: t, defaultToNull: n = !0 } = {}) {
		let { url: r, headers: i } = this.cloneRequestState();
		if (t && i.append("Prefer", `count=${t}`), n || i.append("Prefer", "missing=default"), Array.isArray(e)) {
			let t = e.reduce((e, t) => e.concat(Object.keys(t)), []);
			if (t.length > 0) {
				let e = [...new Set(t)].map((e) => `"${e}"`);
				r.searchParams.set("columns", e.join(","));
			}
		}
		return new _({
			method: "POST",
			url: r,
			headers: i,
			schema: this.schema,
			body: e,
			fetch: this.fetch ?? fetch,
			urlLengthLimit: this.urlLengthLimit,
			retry: this.retry
		});
	}
	upsert(e, { onConflict: t, ignoreDuplicates: n = !1, count: r, defaultToNull: i = !0 } = {}) {
		let { url: a, headers: o } = this.cloneRequestState();
		if (o.append("Prefer", `resolution=${n ? "ignore" : "merge"}-duplicates`), t !== void 0 && a.searchParams.set("on_conflict", t), r && o.append("Prefer", `count=${r}`), i || o.append("Prefer", "missing=default"), Array.isArray(e)) {
			let t = e.reduce((e, t) => e.concat(Object.keys(t)), []);
			if (t.length > 0) {
				let e = [...new Set(t)].map((e) => `"${e}"`);
				a.searchParams.set("columns", e.join(","));
			}
		}
		return new _({
			method: "POST",
			url: a,
			headers: o,
			schema: this.schema,
			body: e,
			fetch: this.fetch ?? fetch,
			urlLengthLimit: this.urlLengthLimit,
			retry: this.retry
		});
	}
	update(e, { count: t } = {}) {
		let { url: n, headers: r } = this.cloneRequestState();
		return t && r.append("Prefer", `count=${t}`), new _({
			method: "PATCH",
			url: n,
			headers: r,
			schema: this.schema,
			body: e,
			fetch: this.fetch ?? fetch,
			urlLengthLimit: this.urlLengthLimit,
			retry: this.retry
		});
	}
	delete({ count: e } = {}) {
		let { url: t, headers: n } = this.cloneRequestState();
		return e && n.append("Prefer", `count=${e}`), new _({
			method: "DELETE",
			url: t,
			headers: n,
			schema: this.schema,
			fetch: this.fetch ?? fetch,
			urlLengthLimit: this.urlLengthLimit,
			retry: this.retry
		});
	}
};
function re(e) {
	"@babel/helpers - typeof";
	return re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, re(e);
}
function ie(e, t) {
	if (re(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (re(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function ae(e) {
	var t = ie(e, "string");
	return re(t) == "symbol" ? t : t + "";
}
function oe(e, t, n) {
	return (t = ae(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function se(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ce(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? se(Object(n), !0).forEach(function(t) {
			oe(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : se(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
var le = class e {
	constructor(e, { headers: t = {}, schema: n, fetch: r, timeout: i, urlLengthLimit: a = 8e3, retry: o } = {}) {
		this.url = e, this.headers = new Headers(t), this.schemaName = n, this.urlLengthLimit = a;
		let s = r ?? globalThis.fetch;
		i !== void 0 && i > 0 ? this.fetch = (e, t) => {
			let n = new AbortController(), r = setTimeout(() => n.abort(), i), a = t?.signal;
			if (a) {
				if (a.aborted) return clearTimeout(r), s(e, t);
				let i = () => {
					clearTimeout(r), n.abort();
				};
				return a.addEventListener("abort", i, { once: !0 }), s(e, ce(ce({}, t), {}, { signal: n.signal })).finally(() => {
					clearTimeout(r), a.removeEventListener("abort", i);
				});
			}
			return s(e, ce(ce({}, t), {}, { signal: n.signal })).finally(() => clearTimeout(r));
		} : this.fetch = s, this.retry = o;
	}
	from(e) {
		if (!e || typeof e != "string" || e.trim() === "") throw Error("Invalid relation name: relation must be a non-empty string.");
		return new ne(new URL(`${this.url}/${e}`), {
			headers: new Headers(this.headers),
			schema: this.schemaName,
			fetch: this.fetch,
			urlLengthLimit: this.urlLengthLimit,
			retry: this.retry
		});
	}
	schema(t) {
		return new e(this.url, {
			headers: this.headers,
			schema: t,
			fetch: this.fetch,
			urlLengthLimit: this.urlLengthLimit,
			retry: this.retry
		});
	}
	rpc(e, t = {}, { head: n = !1, get: r = !1, count: i } = {}) {
		let a, o = new URL(`${this.url}/rpc/${e}`), s, c = (e) => typeof e == "object" && !!e && (!Array.isArray(e) || e.some(c)), l = n && Object.values(t).some(c);
		l ? (a = "POST", s = t) : n || r ? (a = n ? "HEAD" : "GET", Object.entries(t).filter(([e, t]) => t !== void 0).map(([e, t]) => [e, Array.isArray(t) ? `{${t.join(",")}}` : `${t}`]).forEach(([e, t]) => {
			o.searchParams.append(e, t);
		})) : (a = "POST", s = t);
		let u = new Headers(this.headers);
		return l ? u.set("Prefer", i ? `count=${i},return=minimal` : "return=minimal") : i && u.set("Prefer", `count=${i}`), new _({
			method: a,
			url: o,
			headers: u,
			schema: this.schemaName,
			body: s,
			fetch: this.fetch ?? fetch,
			urlLengthLimit: this.urlLengthLimit,
			retry: this.retry
		});
	}
}, ue = class {
	constructor() {}
	static detectEnvironment() {
		if (typeof WebSocket < "u") return {
			type: "native",
			wsConstructor: WebSocket
		};
		let e = globalThis;
		if (typeof globalThis < "u" && e.WebSocket !== void 0) return {
			type: "native",
			wsConstructor: e.WebSocket
		};
		let t = typeof global < "u" ? global : void 0;
		if (t && t.WebSocket !== void 0) return {
			type: "native",
			wsConstructor: t.WebSocket
		};
		if (typeof globalThis < "u" && e.WebSocketPair !== void 0 && globalThis.WebSocket === void 0) return {
			type: "cloudflare",
			error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
			workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."
		};
		if (typeof globalThis < "u" && e.EdgeRuntime || typeof navigator < "u" && navigator.userAgent?.includes("Vercel-Edge")) return {
			type: "unsupported",
			error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
			workaround: "Use serverless functions or a different deployment target for WebSocket functionality."
		};
		let n = globalThis.process;
		if (n) {
			let e = n.versions;
			if (e && e.node) return {
				type: "unsupported",
				error: "Node.js detected but native WebSocket not found.",
				workaround: "Ensure you are running Node.js 22+ or provide a WebSocket implementation via the transport option."
			};
		}
		return {
			type: "unsupported",
			error: "Unknown JavaScript runtime without WebSocket support.",
			workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
		};
	}
	static getWebSocketConstructor() {
		let e = this.detectEnvironment();
		if (e.wsConstructor) return e.wsConstructor;
		let t = e.error || "WebSocket not supported in this environment.";
		throw e.workaround && (t += `\n\nSuggested solution: ${e.workaround}`), Error(t);
	}
	static isWebSocketSupported() {
		try {
			return this.detectEnvironment().type === "native";
		} catch {
			return !1;
		}
	}
}, de = "realtime-js/2.110.3", fe = "1.0.0", pe = "2.0.0", me = pe, he = 1e4, v = {
	closed: "closed",
	errored: "errored",
	joined: "joined",
	joining: "joining",
	leaving: "leaving"
}, ge = {
	close: "phx_close",
	error: "phx_error",
	join: "phx_join",
	reply: "phx_reply",
	leave: "phx_leave",
	access_token: "access_token"
}, _e = {
	connecting: "connecting",
	open: "open",
	closing: "closing",
	closed: "closed"
}, ve = class {
	constructor(e) {
		this.HEADER_LENGTH = 1, this.USER_BROADCAST_PUSH_META_LENGTH = 6, this.KINDS = {
			userBroadcastPush: 3,
			userBroadcast: 4
		}, this.BINARY_ENCODING = 0, this.JSON_ENCODING = 1, this.BROADCAST_EVENT = "broadcast", this.allowedMetadataKeys = [], this.allowedMetadataKeys = e ?? [];
	}
	encode(e, t) {
		if (e.event === this.BROADCAST_EVENT && !(e.payload instanceof ArrayBuffer) && typeof e.payload.event == "string") return t(this._binaryEncodeUserBroadcastPush(e));
		let n = [
			e.join_ref,
			e.ref,
			e.topic,
			e.event,
			e.payload
		];
		return t(JSON.stringify(n));
	}
	_binaryEncodeUserBroadcastPush(e) {
		return this._isArrayBuffer(e.payload?.payload) ? this._encodeBinaryUserBroadcastPush(e) : this._encodeJsonUserBroadcastPush(e);
	}
	_encodeBinaryUserBroadcastPush(e) {
		let t = e.payload?.payload ?? /* @__PURE__ */ new ArrayBuffer(0);
		return this._encodeUserBroadcastPush(e, this.BINARY_ENCODING, t);
	}
	_encodeJsonUserBroadcastPush(e) {
		let t = e.payload?.payload ?? {}, n = new TextEncoder().encode(JSON.stringify(t)).buffer;
		return this._encodeUserBroadcastPush(e, this.JSON_ENCODING, n);
	}
	_encodeUserBroadcastPush(e, t, n) {
		let r = e.topic, i = e.ref ?? "", a = e.join_ref ?? "", o = e.payload.event, s = this.allowedMetadataKeys ? this._pick(e.payload, this.allowedMetadataKeys) : {}, c = Object.keys(s).length === 0 ? "" : JSON.stringify(s);
		if (a.length > 255) throw Error(`joinRef length ${a.length} exceeds maximum of 255`);
		if (i.length > 255) throw Error(`ref length ${i.length} exceeds maximum of 255`);
		if (r.length > 255) throw Error(`topic length ${r.length} exceeds maximum of 255`);
		if (o.length > 255) throw Error(`userEvent length ${o.length} exceeds maximum of 255`);
		if (c.length > 255) throw Error(`metadata length ${c.length} exceeds maximum of 255`);
		let l = this.USER_BROADCAST_PUSH_META_LENGTH + a.length + i.length + r.length + o.length + c.length, u = new ArrayBuffer(this.HEADER_LENGTH + l), d = new DataView(u), f = 0;
		d.setUint8(f++, this.KINDS.userBroadcastPush), d.setUint8(f++, a.length), d.setUint8(f++, i.length), d.setUint8(f++, r.length), d.setUint8(f++, o.length), d.setUint8(f++, c.length), d.setUint8(f++, t), Array.from(a, (e) => d.setUint8(f++, e.charCodeAt(0))), Array.from(i, (e) => d.setUint8(f++, e.charCodeAt(0))), Array.from(r, (e) => d.setUint8(f++, e.charCodeAt(0))), Array.from(o, (e) => d.setUint8(f++, e.charCodeAt(0))), Array.from(c, (e) => d.setUint8(f++, e.charCodeAt(0)));
		var p = new Uint8Array(u.byteLength + n.byteLength);
		return p.set(new Uint8Array(u), 0), p.set(new Uint8Array(n), u.byteLength), p.buffer;
	}
	decode(e, t) {
		if (this._isArrayBuffer(e)) return t(this._binaryDecode(e));
		if (typeof e == "string") {
			let [n, r, i, a, o] = JSON.parse(e);
			return t({
				join_ref: n,
				ref: r,
				topic: i,
				event: a,
				payload: o
			});
		}
		return t({});
	}
	_binaryDecode(e) {
		let t = new DataView(e), n = t.getUint8(0), r = new TextDecoder();
		switch (n) {
			case this.KINDS.userBroadcast: return this._decodeUserBroadcast(e, t, r);
		}
	}
	_decodeUserBroadcast(e, t, n) {
		let r = t.getUint8(1), i = t.getUint8(2), a = t.getUint8(3), o = t.getUint8(4), s = this.HEADER_LENGTH + 4, c = n.decode(e.slice(s, s + r));
		s += r;
		let l = n.decode(e.slice(s, s + i));
		s += i;
		let u = n.decode(e.slice(s, s + a));
		s += a;
		let d = e.slice(s, e.byteLength), f = o === this.JSON_ENCODING ? JSON.parse(n.decode(d)) : d, p = {
			type: this.BROADCAST_EVENT,
			event: l,
			payload: f
		};
		return a > 0 && (p.meta = JSON.parse(u)), {
			join_ref: null,
			ref: null,
			topic: c,
			event: this.BROADCAST_EVENT,
			payload: p
		};
	}
	_isArrayBuffer(e) {
		return e instanceof ArrayBuffer || e?.constructor?.name === "ArrayBuffer";
	}
	_pick(e, t) {
		return !e || typeof e != "object" ? {} : Object.fromEntries(Object.entries(e).filter(([e]) => t.includes(e)));
	}
}, y;
(function(e) {
	e.abstime = "abstime", e.bool = "bool", e.date = "date", e.daterange = "daterange", e.float4 = "float4", e.float8 = "float8", e.int2 = "int2", e.int4 = "int4", e.int4range = "int4range", e.int8 = "int8", e.int8range = "int8range", e.json = "json", e.jsonb = "jsonb", e.money = "money", e.numeric = "numeric", e.oid = "oid", e.reltime = "reltime", e.text = "text", e.time = "time", e.timestamp = "timestamp", e.timestamptz = "timestamptz", e.timetz = "timetz", e.tsrange = "tsrange", e.tstzrange = "tstzrange";
})(y ||= {});
var ye = (e, t, n = {}) => {
	let r = n.skipTypes ?? [];
	return t ? Object.keys(t).reduce((n, i) => (n[i] = be(i, e, t, r), n), {}) : {};
}, be = (e, t, n, r) => {
	let i = t.find((t) => t.name === e)?.type, a = n[e];
	return i && !r.includes(i) ? xe(i, a) : Se(a);
}, xe = (e, t) => {
	if (e.charAt(0) === "_") return Ee(t, e.slice(1, e.length));
	switch (e) {
		case y.bool: return Ce(t);
		case y.float4:
		case y.float8:
		case y.int2:
		case y.int4:
		case y.int8:
		case y.numeric:
		case y.oid: return we(t);
		case y.json:
		case y.jsonb: return Te(t);
		case y.timestamp: return De(t);
		case y.abstime:
		case y.date:
		case y.daterange:
		case y.int4range:
		case y.int8range:
		case y.money:
		case y.reltime:
		case y.text:
		case y.time:
		case y.timestamptz:
		case y.timetz:
		case y.tsrange:
		case y.tstzrange: return Se(t);
		default: return Se(t);
	}
}, Se = (e) => e, Ce = (e) => {
	switch (e) {
		case "t": return !0;
		case "f": return !1;
		default: return e;
	}
}, we = (e) => {
	if (typeof e == "string") {
		let t = parseFloat(e);
		if (!Number.isNaN(t)) return t;
	}
	return e;
}, Te = (e) => {
	if (typeof e == "string") try {
		return JSON.parse(e);
	} catch {
		return e;
	}
	return e;
}, Ee = (e, t) => {
	if (typeof e != "string") return e;
	let n = e.length - 1, r = e[n];
	if (e[0] === "{" && r === "}") {
		let r, i = e.slice(1, n);
		try {
			r = JSON.parse("[" + i + "]");
		} catch {
			r = i ? i.split(",") : [];
		}
		return r.map((e) => xe(t, e));
	}
	return e;
}, De = (e) => typeof e == "string" ? e.replace(" ", "T") : e, Oe = (e) => {
	let t = new URL(e);
	return t.protocol = t.protocol.replace(/^ws/i, "http"), t.pathname = t.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, ""), t.pathname === "" || t.pathname === "/" ? t.pathname = "/api/broadcast" : t.pathname += "/api/broadcast", t.href;
}, ke = (e) => typeof e == "function" ? e : function() {
	return e;
}, Ae = typeof self < "u" ? self : null, je = typeof window < "u" ? window : null, b = Ae || je || globalThis, Me = "2.0.0", Ne = 1e4, Pe = 1e3, x = {
	connecting: 0,
	open: 1,
	closing: 2,
	closed: 3
}, S = {
	closed: "closed",
	errored: "errored",
	joined: "joined",
	joining: "joining",
	leaving: "leaving"
}, C = {
	close: "phx_close",
	error: "phx_error",
	join: "phx_join",
	reply: "phx_reply",
	leave: "phx_leave"
}, Fe = {
	longpoll: "longpoll",
	websocket: "websocket"
}, Ie = { complete: 4 }, Le = "base64url.bearer.phx.", Re = class {
	constructor(e, t, n, r) {
		this.channel = e, this.event = t, this.payload = n || function() {
			return {};
		}, this.receivedResp = null, this.timeout = r, this.timeoutTimer = null, this.recHooks = [], this.sent = !1, this.ref = void 0;
	}
	resend(e) {
		this.timeout = e, this.reset(), this.send();
	}
	send() {
		this.hasReceived("timeout") || (this.startTimeout(), this.sent = !0, this.channel.socket.push({
			topic: this.channel.topic,
			event: this.event,
			payload: this.payload(),
			ref: this.ref,
			join_ref: this.channel.joinRef()
		}));
	}
	receive(e, t) {
		return this.hasReceived(e) && t(this.receivedResp.response), this.recHooks.push({
			status: e,
			callback: t
		}), this;
	}
	reset() {
		this.cancelRefEvent(), this.ref = null, this.refEvent = null, this.receivedResp = null, this.sent = !1;
	}
	destroy() {
		this.cancelRefEvent(), this.cancelTimeout();
	}
	matchReceive({ status: e, response: t, _ref: n }) {
		this.recHooks.filter((t) => t.status === e).forEach((e) => e.callback(t));
	}
	cancelRefEvent() {
		this.refEvent && this.channel.off(this.refEvent);
	}
	cancelTimeout() {
		clearTimeout(this.timeoutTimer), this.timeoutTimer = null;
	}
	startTimeout() {
		this.timeoutTimer && this.cancelTimeout(), this.ref = this.channel.socket.makeRef(), this.refEvent = this.channel.replyEventName(this.ref), this.channel.on(this.refEvent, (e) => {
			this.cancelRefEvent(), this.cancelTimeout(), this.receivedResp = e, this.matchReceive(e);
		}), this.timeoutTimer = setTimeout(() => {
			this.trigger("timeout", {});
		}, this.timeout);
	}
	hasReceived(e) {
		return this.receivedResp && this.receivedResp.status === e;
	}
	trigger(e, t) {
		this.channel.trigger(this.refEvent, {
			status: e,
			response: t
		});
	}
}, ze = class {
	constructor(e, t) {
		this.callback = e, this.timerCalc = t, this.timer = void 0, this.tries = 0;
	}
	reset() {
		this.tries = 0, clearTimeout(this.timer);
	}
	scheduleTimeout() {
		clearTimeout(this.timer), this.timer = setTimeout(() => {
			this.tries += 1, this.callback();
		}, this.timerCalc(this.tries + 1));
	}
}, Be = class {
	constructor(e, t, n) {
		this.state = S.closed, this.topic = e, this.params = ke(t || {}), this.socket = n, this.bindings = [], this.bindingRef = 0, this.timeout = this.socket.timeout, this.joinedOnce = !1, this.joinPush = new Re(this, C.join, this.params, this.timeout), this.pushBuffer = [], this.stateChangeRefs = [], this.rejoinTimer = new ze(() => {
			this.socket.isConnected() && this.rejoin();
		}, this.socket.rejoinAfterMs), this.stateChangeRefs.push(this.socket.onError(() => this.rejoinTimer.reset())), this.stateChangeRefs.push(this.socket.onOpen(() => {
			this.rejoinTimer.reset(), this.isErrored() && this.rejoin();
		})), this.joinPush.receive("ok", () => {
			this.state = S.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((e) => e.send()), this.pushBuffer = [];
		}), this.joinPush.receive("error", (e) => {
			this.state = S.errored, this.socket.hasLogger() && this.socket.log("channel", `error ${this.topic}`, e), this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
		}), this.onClose(() => {
			this.rejoinTimer.reset(), this.socket.hasLogger() && this.socket.log("channel", `close ${this.topic}`), this.state = S.closed, this.socket.remove(this);
		}), this.onError((e) => {
			this.socket.hasLogger() && this.socket.log("channel", `error ${this.topic}`, e), this.isJoining() && this.joinPush.reset(), this.state = S.errored, this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
		}), this.joinPush.receive("timeout", () => {
			this.socket.hasLogger() && this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), new Re(this, C.leave, ke({}), this.timeout).send(), this.state = S.errored, this.joinPush.reset(), this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
		}), this.on(C.reply, (e, t) => {
			this.trigger(this.replyEventName(t), e);
		});
	}
	join(e = this.timeout) {
		if (this.joinedOnce) throw Error("tried to join multiple times. 'join' can only be called a single time per channel instance");
		return this.timeout = e, this.joinedOnce = !0, this.rejoin(), this.joinPush;
	}
	teardown() {
		this.pushBuffer.forEach((e) => e.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = S.closed, this.bindings = [];
	}
	onClose(e) {
		this.on(C.close, e);
	}
	onError(e) {
		return this.on(C.error, (t) => e(t));
	}
	on(e, t) {
		let n = this.bindingRef++;
		return this.bindings.push({
			event: e,
			ref: n,
			callback: t
		}), n;
	}
	off(e, t) {
		this.bindings = this.bindings.filter((n) => !(n.event === e && (t === void 0 || t === n.ref)));
	}
	canPush() {
		return this.socket.isConnected() && this.isJoined();
	}
	push(e, t, n = this.timeout) {
		if (t ||= {}, !this.joinedOnce) throw Error(`tried to push '${e}' to '${this.topic}' before joining. Use channel.join() before pushing events`);
		let r = new Re(this, e, function() {
			return t;
		}, n);
		return this.canPush() ? r.send() : (r.startTimeout(), this.pushBuffer.push(r)), r;
	}
	leave(e = this.timeout) {
		this.rejoinTimer.reset(), this.joinPush.cancelTimeout(), this.state = S.leaving;
		let t = () => {
			this.socket.hasLogger() && this.socket.log("channel", `leave ${this.topic}`), this.trigger(C.close, "leave");
		}, n = new Re(this, C.leave, ke({}), e);
		return n.receive("ok", () => t()).receive("timeout", () => t()), n.send(), this.canPush() || n.trigger("ok", {}), n;
	}
	onMessage(e, t, n) {
		return t;
	}
	filterBindings(e, t, n) {
		return !0;
	}
	isMember(e, t, n, r) {
		return this.topic === e ? r && r !== this.joinRef() ? (this.socket.hasLogger() && this.socket.log("channel", "dropping outdated message", {
			topic: e,
			event: t,
			payload: n,
			joinRef: r
		}), !1) : !0 : !1;
	}
	joinRef() {
		return this.joinPush.ref;
	}
	rejoin(e = this.timeout) {
		this.isLeaving() || (this.socket.leaveOpenTopic(this.topic), this.state = S.joining, this.joinPush.resend(e));
	}
	trigger(e, t, n, r) {
		let i = this.onMessage(e, t, n, r);
		if (t && !i) throw Error("channel onMessage callbacks must return the payload, modified or unmodified");
		let a = this.bindings.filter((r) => r.event === e && this.filterBindings(r, t, n));
		for (let e = 0; e < a.length; e++) a[e].callback(i, n, r || this.joinRef());
	}
	replyEventName(e) {
		return `chan_reply_${e}`;
	}
	isClosed() {
		return this.state === S.closed;
	}
	isErrored() {
		return this.state === S.errored;
	}
	isJoined() {
		return this.state === S.joined;
	}
	isJoining() {
		return this.state === S.joining;
	}
	isLeaving() {
		return this.state === S.leaving;
	}
}, Ve = class {
	static request(e, t, n, r, i, a, o) {
		if (b.XDomainRequest) {
			let n = new b.XDomainRequest();
			return this.xdomainRequest(n, e, t, r, i, a, o);
		} else if (b.XMLHttpRequest) {
			let s = new b.XMLHttpRequest();
			return this.xhrRequest(s, e, t, n, r, i, a, o);
		} else if (b.fetch && b.AbortController) return this.fetchRequest(e, t, n, r, i, a, o);
		else throw Error("No suitable XMLHttpRequest implementation found");
	}
	static fetchRequest(e, t, n, r, i, a, o) {
		let s = {
			method: e,
			headers: n,
			body: r
		}, c = null;
		return i && (c = new AbortController(), setTimeout(() => c.abort(), i), s.signal = c.signal), b.fetch(t, s).then((e) => e.text()).then((e) => this.parseJSON(e)).then((e) => o && o(e)).catch((e) => {
			e.name === "AbortError" && a ? a() : o && o(null);
		}), c;
	}
	static xdomainRequest(e, t, n, r, i, a, o) {
		return e.timeout = i, e.open(t, n), e.onload = () => {
			let t = this.parseJSON(e.responseText);
			o && o(t);
		}, a && (e.ontimeout = a), e.onprogress = () => {}, e.send(r), e;
	}
	static xhrRequest(e, t, n, r, i, a, o, s) {
		e.open(t, n, !0), e.timeout = a;
		for (let [t, n] of Object.entries(r)) e.setRequestHeader(t, n);
		return e.onerror = () => s && s(null), e.onreadystatechange = () => {
			e.readyState === Ie.complete && s && s(this.parseJSON(e.responseText));
		}, o && (e.ontimeout = o), e.send(i), e;
	}
	static parseJSON(e) {
		if (!e || e === "") return null;
		try {
			return JSON.parse(e);
		} catch {
			return console && console.log("failed to parse JSON response", e), null;
		}
	}
	static serialize(e, t) {
		let n = [];
		for (var r in e) {
			if (!Object.prototype.hasOwnProperty.call(e, r)) continue;
			let i = t ? `${t}[${r}]` : r, a = e[r];
			typeof a == "object" ? n.push(this.serialize(a, i)) : n.push(encodeURIComponent(i) + "=" + encodeURIComponent(a));
		}
		return n.join("&");
	}
	static appendParams(e, t) {
		return Object.keys(t).length === 0 ? e : `${e}${e.match(/\?/) ? "&" : "?"}${this.serialize(t)}`;
	}
}, He = (e) => {
	let t = "", n = new Uint8Array(e), r = n.byteLength;
	for (let e = 0; e < r; e++) t += String.fromCharCode(n[e]);
	return btoa(t);
}, Ue = class {
	constructor(e, t) {
		t && t.length === 2 && t[1].startsWith(Le) && (this.authToken = atob(t[1].slice(Le.length))), this.endPoint = null, this.token = null, this.skipHeartbeat = !0, this.reqs = /* @__PURE__ */ new Set(), this.awaitingBatchAck = !1, this.currentBatch = null, this.currentBatchTimer = null, this.batchBuffer = [], this.onopen = function() {}, this.onerror = function() {}, this.onmessage = function() {}, this.onclose = function() {}, this.pollEndpoint = this.normalizeEndpoint(e), this.readyState = x.connecting, setTimeout(() => this.poll(), 0);
	}
	normalizeEndpoint(e) {
		return e.replace("ws://", "http://").replace("wss://", "https://").replace(RegExp("(.*)/" + Fe.websocket), "$1/" + Fe.longpoll);
	}
	endpointURL() {
		return Ve.appendParams(this.pollEndpoint, { token: this.token });
	}
	closeAndRetry(e, t, n) {
		this.close(e, t, n), this.readyState = x.connecting;
	}
	ontimeout() {
		this.onerror("timeout"), this.closeAndRetry(1005, "timeout", !1);
	}
	isActive() {
		return this.readyState === x.open || this.readyState === x.connecting;
	}
	poll() {
		let e = { Accept: "application/json" };
		this.authToken && (e["X-Phoenix-AuthToken"] = this.authToken), this.ajax("GET", e, null, () => this.ontimeout(), (e) => {
			if (e) {
				var { status: t, token: n, messages: r } = e;
				if (t === 410 && this.token !== null) {
					this.onerror(410), this.closeAndRetry(3410, "session_gone", !1);
					return;
				}
				this.token = n;
			} else t = 0;
			switch (t) {
				case 200:
					r.forEach((e) => {
						setTimeout(() => this.onmessage({ data: e }), 0);
					}), this.poll();
					break;
				case 204:
					this.poll();
					break;
				case 410:
					this.readyState = x.open, this.onopen({}), this.poll();
					break;
				case 403:
					this.onerror(403), this.close(1008, "forbidden", !1);
					break;
				case 0:
				case 500:
					this.onerror(500), this.closeAndRetry(1011, "internal server error", 500);
					break;
				default: throw Error(`unhandled poll status ${t}`);
			}
		});
	}
	send(e) {
		typeof e != "string" && (e = He(e)), this.currentBatch ? this.currentBatch.push(e) : this.awaitingBatchAck ? this.batchBuffer.push(e) : (this.currentBatch = [e], this.currentBatchTimer = setTimeout(() => {
			this.batchSend(this.currentBatch), this.currentBatch = null;
		}, 0));
	}
	batchSend(e) {
		this.awaitingBatchAck = !0, this.ajax("POST", { "Content-Type": "application/x-ndjson" }, e.join("\n"), () => this.onerror("timeout"), (e) => {
			this.awaitingBatchAck = !1, !e || e.status !== 200 ? (this.onerror(e && e.status), this.closeAndRetry(1011, "internal server error", !1)) : this.batchBuffer.length > 0 && (this.batchSend(this.batchBuffer), this.batchBuffer = []);
		});
	}
	close(e, t, n) {
		for (let e of this.reqs) e.abort();
		this.readyState = x.closed;
		let r = Object.assign({
			code: 1e3,
			reason: void 0,
			wasClean: !0
		}, {
			code: e,
			reason: t,
			wasClean: n
		});
		this.batchBuffer = [], clearTimeout(this.currentBatchTimer), this.currentBatchTimer = null, typeof CloseEvent < "u" ? this.onclose(new CloseEvent("close", r)) : this.onclose(r);
	}
	ajax(e, t, n, r, i) {
		let a;
		a = Ve.request(e, this.endpointURL(), t, n, this.timeout, () => {
			this.reqs.delete(a), r();
		}, (e) => {
			this.reqs.delete(a), this.isActive() && i(e);
		}), this.reqs.add(a);
	}
}, We = class e {
	constructor(t, n = {}) {
		let r = n.events || {
			state: "presence_state",
			diff: "presence_diff"
		};
		this.state = {}, this.pendingDiffs = [], this.channel = t, this.joinRef = null, this.caller = {
			onJoin: function() {},
			onLeave: function() {},
			onSync: function() {}
		}, this.channel.on(r.state, (t) => {
			let { onJoin: n, onLeave: r, onSync: i } = this.caller;
			this.joinRef = this.channel.joinRef(), this.state = e.syncState(this.state, t, n, r), this.pendingDiffs.forEach((t) => {
				this.state = e.syncDiff(this.state, t, n, r);
			}), this.pendingDiffs = [], i();
		}), this.channel.on(r.diff, (t) => {
			let { onJoin: n, onLeave: r, onSync: i } = this.caller;
			this.inPendingSyncState() ? this.pendingDiffs.push(t) : (this.state = e.syncDiff(this.state, t, n, r), i());
		});
	}
	onJoin(e) {
		this.caller.onJoin = e;
	}
	onLeave(e) {
		this.caller.onLeave = e;
	}
	onSync(e) {
		this.caller.onSync = e;
	}
	list(t) {
		return e.list(this.state, t);
	}
	inPendingSyncState() {
		return !this.joinRef || this.joinRef !== this.channel.joinRef();
	}
	static syncState(e, t, n, r) {
		let i = this.clone(e), a = {}, o = {};
		return this.map(i, (e, n) => {
			t[e] || (o[e] = n);
		}), this.map(t, (e, t) => {
			let n = i[e];
			if (n) {
				let r = t.metas.map((e) => e.phx_ref), i = n.metas.map((e) => e.phx_ref), s = t.metas.filter((e) => i.indexOf(e.phx_ref) < 0), c = n.metas.filter((e) => r.indexOf(e.phx_ref) < 0);
				s.length > 0 && (a[e] = t, a[e].metas = s), c.length > 0 && (o[e] = this.clone(n), o[e].metas = c);
			} else a[e] = t;
		}), this.syncDiff(i, {
			joins: a,
			leaves: o
		}, n, r);
	}
	static syncDiff(e, t, n, r) {
		let { joins: i, leaves: a } = this.clone(t);
		return n ||= function() {}, r ||= function() {}, this.map(i, (t, r) => {
			let i = e[t];
			if (e[t] = this.clone(r), i) {
				let n = e[t].metas.map((e) => e.phx_ref), r = i.metas.filter((e) => n.indexOf(e.phx_ref) < 0);
				e[t].metas.unshift(...r);
			}
			n(t, i, r);
		}), this.map(a, (t, n) => {
			let i = e[t];
			if (!i) return;
			let a = n.metas.map((e) => e.phx_ref);
			i.metas = i.metas.filter((e) => a.indexOf(e.phx_ref) < 0), r(t, i, n), i.metas.length === 0 && delete e[t];
		}), e;
	}
	static list(e, t) {
		return t ||= function(e, t) {
			return t;
		}, this.map(e, (e, n) => t(e, n));
	}
	static map(e, t) {
		return Object.getOwnPropertyNames(e).map((n) => t(n, e[n]));
	}
	static clone(e) {
		return JSON.parse(JSON.stringify(e));
	}
}, Ge = {
	HEADER_LENGTH: 1,
	META_LENGTH: 4,
	KINDS: {
		push: 0,
		reply: 1,
		broadcast: 2
	},
	encode(e, t) {
		if (e.payload.constructor === ArrayBuffer) return t(this.binaryEncode(e));
		{
			let n = [
				e.join_ref,
				e.ref,
				e.topic,
				e.event,
				e.payload
			];
			return t(JSON.stringify(n));
		}
	},
	decode(e, t) {
		if (e.constructor === ArrayBuffer) return t(this.binaryDecode(e));
		{
			let [n, r, i, a, o] = JSON.parse(e);
			return t({
				join_ref: n,
				ref: r,
				topic: i,
				event: a,
				payload: o
			});
		}
	},
	binaryEncode(e) {
		let { join_ref: t, ref: n, event: r, topic: i, payload: a } = e, o = this.META_LENGTH + t.length + n.length + i.length + r.length, s = new ArrayBuffer(this.HEADER_LENGTH + o), c = new DataView(s), l = 0;
		c.setUint8(l++, this.KINDS.push), c.setUint8(l++, t.length), c.setUint8(l++, n.length), c.setUint8(l++, i.length), c.setUint8(l++, r.length), Array.from(t, (e) => c.setUint8(l++, e.charCodeAt(0))), Array.from(n, (e) => c.setUint8(l++, e.charCodeAt(0))), Array.from(i, (e) => c.setUint8(l++, e.charCodeAt(0))), Array.from(r, (e) => c.setUint8(l++, e.charCodeAt(0)));
		var u = new Uint8Array(s.byteLength + a.byteLength);
		return u.set(new Uint8Array(s), 0), u.set(new Uint8Array(a), s.byteLength), u.buffer;
	},
	binaryDecode(e) {
		let t = new DataView(e), n = t.getUint8(0), r = new TextDecoder();
		switch (n) {
			case this.KINDS.push: return this.decodePush(e, t, r);
			case this.KINDS.reply: return this.decodeReply(e, t, r);
			case this.KINDS.broadcast: return this.decodeBroadcast(e, t, r);
		}
	},
	decodePush(e, t, n) {
		let r = t.getUint8(1), i = t.getUint8(2), a = t.getUint8(3), o = this.HEADER_LENGTH + this.META_LENGTH - 1, s = n.decode(e.slice(o, o + r));
		o += r;
		let c = n.decode(e.slice(o, o + i));
		o += i;
		let l = n.decode(e.slice(o, o + a));
		return o += a, {
			join_ref: s,
			ref: null,
			topic: c,
			event: l,
			payload: e.slice(o, e.byteLength)
		};
	},
	decodeReply(e, t, n) {
		let r = t.getUint8(1), i = t.getUint8(2), a = t.getUint8(3), o = t.getUint8(4), s = this.HEADER_LENGTH + this.META_LENGTH, c = n.decode(e.slice(s, s + r));
		s += r;
		let l = n.decode(e.slice(s, s + i));
		s += i;
		let u = n.decode(e.slice(s, s + a));
		s += a;
		let d = n.decode(e.slice(s, s + o));
		s += o;
		let f = {
			status: d,
			response: e.slice(s, e.byteLength)
		};
		return {
			join_ref: c,
			ref: l,
			topic: u,
			event: C.reply,
			payload: f
		};
	},
	decodeBroadcast(e, t, n) {
		let r = t.getUint8(1), i = t.getUint8(2), a = this.HEADER_LENGTH + 2, o = n.decode(e.slice(a, a + r));
		a += r;
		let s = n.decode(e.slice(a, a + i));
		return a += i, {
			join_ref: null,
			ref: null,
			topic: o,
			event: s,
			payload: e.slice(a, e.byteLength)
		};
	}
}, Ke = class {
	constructor(e, t = {}) {
		this.stateChangeCallbacks = {
			open: [],
			close: [],
			error: [],
			message: []
		}, this.channels = [], this.sendBuffer = [], this.ref = 0, this.fallbackRef = null, this.timeout = t.timeout || Ne, this.transport = t.transport || b.WebSocket || Ue, this.conn = void 0, this.primaryPassedHealthCheck = !1, this.longPollFallbackMs = t.longPollFallbackMs, this.fallbackTimer = null;
		let n = null;
		try {
			n = b && b.sessionStorage;
		} catch {}
		this.sessionStore = t.sessionStorage || n, this.establishedConnections = 0, this.defaultEncoder = Ge.encode.bind(Ge), this.defaultDecoder = Ge.decode.bind(Ge), this.closeWasClean = !0, this.disconnecting = !1, this.binaryType = t.binaryType || "arraybuffer", this.connectClock = 1, this.pageHidden = !1, this.encode = void 0, this.decode = void 0, this.transport === Ue ? (this.encode = this.defaultEncoder, this.decode = this.defaultDecoder) : (this.encode = t.encode || this.defaultEncoder, this.decode = t.decode || this.defaultDecoder);
		let r = null;
		je && je.addEventListener && (je.addEventListener("pagehide", (e) => {
			this.conn && (this.disconnect(), r = this.connectClock);
		}), je.addEventListener("pageshow", (e) => {
			r === this.connectClock && (r = null, this.connect());
		}), je.addEventListener("visibilitychange", () => {
			document.visibilityState === "hidden" ? this.pageHidden = !0 : (this.pageHidden = !1, !this.isConnected() && !this.closeWasClean && this.teardown(() => this.connect()));
		})), this.heartbeatIntervalMs = t.heartbeatIntervalMs || 3e4, this.autoSendHeartbeat = t.autoSendHeartbeat ?? !0, this.heartbeatCallback = t.heartbeatCallback ?? (() => {}), this.rejoinAfterMs = (e) => t.rejoinAfterMs ? t.rejoinAfterMs(e) : [
			1e3,
			2e3,
			5e3
		][e - 1] || 1e4, this.reconnectAfterMs = (e) => t.reconnectAfterMs ? t.reconnectAfterMs(e) : [
			10,
			50,
			100,
			150,
			200,
			250,
			500,
			1e3,
			2e3
		][e - 1] || 5e3, this.logger = t.logger || null, !this.logger && t.debug && (this.logger = (e, t, n) => {
			console.log(`${e}: ${t}`, n);
		}), this.longpollerTimeout = t.longpollerTimeout || 2e4, this.params = ke(t.params || {}), this.endPoint = `${e}/${Fe.websocket}`, this.vsn = t.vsn || Me, this.heartbeatTimeoutTimer = null, this.heartbeatTimer = null, this.heartbeatSentAt = null, this.pendingHeartbeatRef = null, this.reconnectTimer = new ze(() => {
			if (this.pageHidden) {
				this.log("Not reconnecting as page is hidden!"), this.teardown();
				return;
			}
			this.teardown(async () => {
				t.beforeReconnect && await t.beforeReconnect(), this.connect();
			});
		}, this.reconnectAfterMs), this.authToken = t.authToken;
	}
	getLongPollTransport() {
		return Ue;
	}
	replaceTransport(e) {
		this.connectClock++, this.closeWasClean = !0, clearTimeout(this.fallbackTimer), this.reconnectTimer.reset(), this.conn &&= (this.conn.close(), null), this.transport = e;
	}
	protocol() {
		return location.protocol.match(/^https/) ? "wss" : "ws";
	}
	endPointURL() {
		let e = Ve.appendParams(Ve.appendParams(this.endPoint, this.params()), { vsn: this.vsn });
		return e.charAt(0) === "/" ? e.charAt(1) === "/" ? `${this.protocol()}:${e}` : `${this.protocol()}://${location.host}${e}` : e;
	}
	disconnect(e, t, n) {
		this.connectClock++, this.disconnecting = !0, this.closeWasClean = !0, clearTimeout(this.fallbackTimer), this.reconnectTimer.reset(), this.teardown(() => {
			this.disconnecting = !1, e && e();
		}, t, n);
	}
	connect(e) {
		e && (console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor"), this.params = ke(e)), !(this.conn && !this.disconnecting) && (this.longPollFallbackMs && this.transport !== Ue ? this.connectWithFallback(Ue, this.longPollFallbackMs) : this.transportConnect());
	}
	log(e, t, n) {
		this.logger && this.logger(e, t, n);
	}
	hasLogger() {
		return this.logger !== null;
	}
	onOpen(e) {
		let t = this.makeRef();
		return this.stateChangeCallbacks.open.push([t, e]), t;
	}
	onClose(e) {
		let t = this.makeRef();
		return this.stateChangeCallbacks.close.push([t, e]), t;
	}
	onError(e) {
		let t = this.makeRef();
		return this.stateChangeCallbacks.error.push([t, e]), t;
	}
	onMessage(e) {
		let t = this.makeRef();
		return this.stateChangeCallbacks.message.push([t, e]), t;
	}
	onHeartbeat(e) {
		this.heartbeatCallback = e;
	}
	ping(e) {
		if (!this.isConnected()) return !1;
		let t = this.makeRef(), n = Date.now();
		this.push({
			topic: "phoenix",
			event: "heartbeat",
			payload: {},
			ref: t
		});
		let r = this.onMessage((i) => {
			i.ref === t && (this.off([r]), e(Date.now() - n));
		});
		return !0;
	}
	transportName(e) {
		switch (e) {
			case Ue: return "LongPoll";
			default: return e.name;
		}
	}
	transportConnect() {
		this.connectClock++, this.closeWasClean = !1;
		let e;
		this.authToken && (e = ["phoenix", `${Le}${btoa(this.authToken).replace(/=/g, "")}`]), this.conn = new this.transport(this.endPointURL(), e), this.conn.binaryType = this.binaryType, this.conn.timeout = this.longpollerTimeout, this.conn.onopen = () => this.onConnOpen(), this.conn.onerror = (e) => this.onConnError(e), this.conn.onmessage = (e) => this.onConnMessage(e), this.conn.onclose = (e) => this.onConnClose(e);
	}
	getSession(e) {
		return this.sessionStore && this.sessionStore.getItem(e);
	}
	storeSession(e, t) {
		this.sessionStore && this.sessionStore.setItem(e, t);
	}
	connectWithFallback(e, t = 2500) {
		clearTimeout(this.fallbackTimer);
		let n = !1, r = !0, i, a = this.transportName(e), o = (t) => {
			this.log("transport", `falling back to ${a}...`, t), this.off([void 0, i]), r = !1, this.replaceTransport(e), this.transportConnect();
		};
		if (this.getSession(`phx:fallback:${a}`)) return o("memorized");
		this.fallbackTimer = setTimeout(o, t), i = this.onError((e) => {
			this.log("transport", "error", e), r && !n && (clearTimeout(this.fallbackTimer), o(e));
		}), this.fallbackRef && this.off([this.fallbackRef]), this.fallbackRef = this.onOpen(() => {
			if (n = !0, !r) {
				let t = this.transportName(e);
				return this.primaryPassedHealthCheck || this.storeSession(`phx:fallback:${t}`, "true"), this.log("transport", `established ${t} fallback`);
			}
			clearTimeout(this.fallbackTimer), this.fallbackTimer = setTimeout(o, t), this.ping((e) => {
				this.log("transport", "connected to primary after", e), this.primaryPassedHealthCheck = !0, clearTimeout(this.fallbackTimer);
			});
		}), this.transportConnect();
	}
	clearHeartbeats() {
		clearTimeout(this.heartbeatTimer), clearTimeout(this.heartbeatTimeoutTimer);
	}
	onConnOpen() {
		this.hasLogger() && this.log("transport", `connected to ${this.endPointURL()}`), this.closeWasClean = !1, this.disconnecting = !1, this.establishedConnections++, this.flushSendBuffer(), this.reconnectTimer.reset(), this.autoSendHeartbeat && this.resetHeartbeat(), this.triggerStateCallbacks("open");
	}
	heartbeatTimeout() {
		if (this.pendingHeartbeatRef) {
			this.pendingHeartbeatRef = null, this.heartbeatSentAt = null, this.hasLogger() && this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
			try {
				this.heartbeatCallback("timeout");
			} catch (e) {
				this.log("error", "error in heartbeat callback", e);
			}
			this.triggerChanError(/* @__PURE__ */ Error("heartbeat timeout")), this.closeWasClean = !1, this.teardown(() => this.reconnectTimer.scheduleTimeout(), Pe, "heartbeat timeout");
		}
	}
	resetHeartbeat() {
		this.conn && this.conn.skipHeartbeat || (this.pendingHeartbeatRef = null, this.clearHeartbeats(), this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs));
	}
	teardown(e, t, n) {
		if (!this.conn) return e && e();
		let r = this.conn;
		this.waitForBufferDone(r, () => {
			t ? r.close(t, n || "") : r.close(), this.waitForSocketClosed(r, () => {
				this.conn === r && (this.conn.onopen = function() {}, this.conn.onerror = function() {}, this.conn.onmessage = function() {}, this.conn.onclose = function() {}, this.conn = null), e && e();
			});
		});
	}
	waitForBufferDone(e, t, n = 1) {
		if (n === 5 || !e.bufferedAmount) {
			t();
			return;
		}
		setTimeout(() => {
			this.waitForBufferDone(e, t, n + 1);
		}, 150 * n);
	}
	waitForSocketClosed(e, t, n = 1) {
		if (n === 5 || e.readyState === x.closed) {
			t();
			return;
		}
		setTimeout(() => {
			this.waitForSocketClosed(e, t, n + 1);
		}, 150 * n);
	}
	onConnClose(e) {
		this.conn && (this.conn.onclose = () => {}), this.hasLogger() && this.log("transport", "close", e), this.triggerChanError(e), this.clearHeartbeats(), this.closeWasClean || this.reconnectTimer.scheduleTimeout(), this.triggerStateCallbacks("close", e);
	}
	onConnError(e) {
		this.hasLogger() && this.log("transport", "error", e);
		let t = this.transport, n = this.establishedConnections;
		this.triggerStateCallbacks("error", e, t, n), (t === this.transport || n > 0) && this.triggerChanError(e);
	}
	triggerChanError(e) {
		this.channels.forEach((t) => {
			t.isErrored() || t.isLeaving() || t.isClosed() || t.trigger(C.error, e);
		});
	}
	connectionState() {
		switch (this.conn && this.conn.readyState) {
			case x.connecting: return "connecting";
			case x.open: return "open";
			case x.closing: return "closing";
			default: return "closed";
		}
	}
	isConnected() {
		return this.connectionState() === "open";
	}
	remove(e) {
		this.off(e.stateChangeRefs), this.channels = this.channels.filter((t) => t !== e);
	}
	off(e) {
		for (let t in this.stateChangeCallbacks) this.stateChangeCallbacks[t] = this.stateChangeCallbacks[t].filter(([t]) => e.indexOf(t) === -1);
	}
	channel(e, t = {}) {
		let n = new Be(e, t, this);
		return this.channels.push(n), n;
	}
	push(e) {
		if (this.hasLogger()) {
			let { topic: t, event: n, payload: r, ref: i, join_ref: a } = e;
			this.log("push", `${t} ${n} (${a}, ${i})`, r);
		}
		this.isConnected() ? this.encode(e, (e) => this.conn.send(e)) : this.sendBuffer.push(() => this.encode(e, (e) => this.conn.send(e)));
	}
	makeRef() {
		let e = this.ref + 1;
		return e === this.ref ? this.ref = 0 : this.ref = e, this.ref.toString();
	}
	sendHeartbeat() {
		if (!this.isConnected()) {
			try {
				this.heartbeatCallback("disconnected");
			} catch (e) {
				this.log("error", "error in heartbeat callback", e);
			}
			return;
		}
		if (this.pendingHeartbeatRef) {
			this.heartbeatTimeout();
			return;
		}
		this.pendingHeartbeatRef = this.makeRef(), this.heartbeatSentAt = Date.now(), this.push({
			topic: "phoenix",
			event: "heartbeat",
			payload: {},
			ref: this.pendingHeartbeatRef
		});
		try {
			this.heartbeatCallback("sent");
		} catch (e) {
			this.log("error", "error in heartbeat callback", e);
		}
		this.heartbeatTimeoutTimer = setTimeout(() => this.heartbeatTimeout(), this.heartbeatIntervalMs);
	}
	flushSendBuffer() {
		this.isConnected() && this.sendBuffer.length > 0 && (this.sendBuffer.forEach((e) => e()), this.sendBuffer = []);
	}
	onConnMessage(e) {
		this.decode(e.data, (e) => {
			let { topic: t, event: n, payload: r, ref: i, join_ref: a } = e;
			if (i && i === this.pendingHeartbeatRef) {
				let e = this.heartbeatSentAt ? Date.now() - this.heartbeatSentAt : void 0;
				this.clearHeartbeats();
				try {
					this.heartbeatCallback(r.status === "ok" ? "ok" : "error", e);
				} catch (e) {
					this.log("error", "error in heartbeat callback", e);
				}
				this.pendingHeartbeatRef = null, this.heartbeatSentAt = null, this.autoSendHeartbeat && (this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs));
			}
			this.hasLogger() && this.log("receive", `${r.status || ""} ${t} ${n} ${i && "(" + i + ")" || ""}`.trim(), r);
			for (let e = 0; e < this.channels.length; e++) {
				let o = this.channels[e];
				o.isMember(t, n, r, a) && o.trigger(n, r, i, a);
			}
			this.triggerStateCallbacks("message", e);
		});
	}
	triggerStateCallbacks(e, ...t) {
		try {
			this.stateChangeCallbacks[e].forEach(([n, r]) => {
				try {
					r(...t);
				} catch (t) {
					this.log("error", `error in ${e} callback`, t);
				}
			});
		} catch (t) {
			this.log("error", `error triggering ${e} callbacks`, t);
		}
	}
	leaveOpenTopic(e) {
		let t = this.channels.find((t) => t.topic === e && (t.isJoined() || t.isJoining()));
		t && (this.hasLogger() && this.log("transport", `leaving duplicate topic "${e}"`), t.leave());
	}
}, qe = class e {
	constructor(t, n) {
		let r = Xe(n);
		this.presence = new We(t.getChannel(), r), this.presence.onJoin((n, r, i) => {
			let a = e.onJoinPayload(n, r, i);
			t.getChannel().trigger("presence", a);
		}), this.presence.onLeave((n, r, i) => {
			let a = e.onLeavePayload(n, r, i);
			t.getChannel().trigger("presence", a);
		}), this.presence.onSync(() => {
			t.getChannel().trigger("presence", { event: "sync" });
		});
	}
	get state() {
		return e.transformState(this.presence.state);
	}
	static transformState(e) {
		return e = Ye(e), Object.getOwnPropertyNames(e).reduce((t, n) => {
			let r = e[n];
			return t[n] = Je(r), t;
		}, {});
	}
	static onJoinPayload(e, t, n) {
		return {
			event: "join",
			key: e,
			currentPresences: Ze(t),
			newPresences: Je(n)
		};
	}
	static onLeavePayload(e, t, n) {
		return {
			event: "leave",
			key: e,
			currentPresences: Ze(t),
			leftPresences: Je(n)
		};
	}
};
function Je(e) {
	return e.metas.map((e) => (e.presence_ref = e.phx_ref, delete e.phx_ref, delete e.phx_ref_prev, e));
}
function Ye(e) {
	return JSON.parse(JSON.stringify(e));
}
function Xe(e) {
	return e?.events && { events: e.events };
}
function Ze(e) {
	return e?.metas ? Je(e) : [];
}
//#endregion
//#region ../node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js
var Qe;
(function(e) {
	e.SYNC = "sync", e.JOIN = "join", e.LEAVE = "leave";
})(Qe ||= {});
var $e = class {
	get state() {
		return this.presenceAdapter.state;
	}
	constructor(e, t) {
		this.channel = e, this.presenceAdapter = new qe(this.channel.channelAdapter, t);
	}
};
//#endregion
//#region ../node_modules/@supabase/realtime-js/dist/module/lib/normalizeChannelError.js
function et(e) {
	if (e instanceof Error) return e;
	if (typeof e == "string") return Error(e);
	if (e && typeof e == "object") {
		let t = e;
		if (typeof t.code == "number") {
			let n = typeof t.reason == "string" && t.reason ? ` (${t.reason})` : "";
			return Error(`socket closed: ${t.code}${n}`, { cause: e });
		}
		return Error("channel error: transport failure", { cause: e });
	}
	return /* @__PURE__ */ Error("channel error: connection lost");
}
//#endregion
//#region ../node_modules/@supabase/realtime-js/dist/module/phoenix/channelAdapter.js
var tt = class {
	constructor(e, t, n) {
		let r = nt(n);
		this.channel = e.getSocket().channel(t, r), this.socket = e;
	}
	get state() {
		return this.channel.state;
	}
	set state(e) {
		this.channel.state = e;
	}
	get joinedOnce() {
		return this.channel.joinedOnce;
	}
	get joinPush() {
		return this.channel.joinPush;
	}
	get rejoinTimer() {
		return this.channel.rejoinTimer;
	}
	on(e, t) {
		return this.channel.on(e, t);
	}
	off(e, t) {
		this.channel.off(e, t);
	}
	subscribe(e) {
		return this.channel.join(e);
	}
	unsubscribe(e) {
		return this.channel.leave(e);
	}
	teardown() {
		this.channel.teardown();
	}
	onClose(e) {
		this.channel.onClose(e);
	}
	onError(e) {
		return this.channel.onError(e);
	}
	push(e, t, n) {
		let r;
		try {
			r = this.channel.push(e, t, n);
		} catch {
			throw Error(`tried to push '${e}' to '${this.channel.topic}' before joining. Use channel.subscribe() before pushing events`);
		}
		if (this.channel.pushBuffer.length > 100) {
			let e = this.channel.pushBuffer.shift();
			e.cancelTimeout(), this.socket.log("channel", `discarded push due to buffer overflow: ${e.event}`, e.payload());
		}
		return r;
	}
	updateJoinPayload(e) {
		let t = this.channel.joinPush.payload();
		this.channel.joinPush.payload = () => Object.assign(Object.assign({}, t), e);
	}
	canPush() {
		return this.socket.isConnected() && this.state === v.joined;
	}
	isJoined() {
		return this.state === v.joined;
	}
	isJoining() {
		return this.state === v.joining;
	}
	isClosed() {
		return this.state === v.closed;
	}
	isLeaving() {
		return this.state === v.leaving;
	}
	updateFilterBindings(e) {
		this.channel.filterBindings = e;
	}
	updatePayloadTransform(e) {
		this.channel.onMessage = e;
	}
	getChannel() {
		return this.channel;
	}
};
function nt(e) {
	return { config: Object.assign({
		broadcast: {
			ack: !1,
			self: !1
		},
		presence: {
			key: "",
			enabled: !1
		},
		private: !1
	}, e.config) };
}
//#endregion
//#region ../node_modules/@supabase/realtime-js/dist/module/RealtimePostgresFilterBuilder.js
var rt = /[,()"\\]/, it = (e) => rt.test(e) || e !== e.trim(), at = (e) => `"${e.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`, ot = (e) => {
	let t = e === null ? "null" : String(e);
	return it(t) ? at(t) : t;
}, st = (e) => e === null ? "null" : String(e), ct = (e, t) => {
	if (e === "in") {
		let e = Array.isArray(t) ? t : [t];
		if (e.length === 0) throw Error("Realtime `in` filter requires at least one value.");
		return `in.(${Array.from(new Set(e)).map((e) => ot(e)).join(",")})`;
	}
	return e === "is" ? `is.${st(t)}` : `${e}.${ot(t)}`;
}, lt = class {
	constructor() {
		this.filters = [];
	}
	add(e, t, n, r = !1) {
		let i = r ? "not." : "";
		return this.filters.push(`${e}=${i}${ct(t, n)}`), this;
	}
	eq(e, t) {
		return this.add(e, "eq", t);
	}
	neq(e, t) {
		return this.add(e, "neq", t);
	}
	gt(e, t) {
		return this.add(e, "gt", t);
	}
	gte(e, t) {
		return this.add(e, "gte", t);
	}
	lt(e, t) {
		return this.add(e, "lt", t);
	}
	lte(e, t) {
		return this.add(e, "lte", t);
	}
	in(e, t) {
		return this.add(e, "in", t);
	}
	like(e, t) {
		return this.add(e, "like", t);
	}
	ilike(e, t) {
		return this.add(e, "ilike", t);
	}
	match(e, t) {
		return this.add(e, "match", t);
	}
	imatch(e, t) {
		return this.add(e, "imatch", t);
	}
	is(e, t) {
		return this.add(e, "is", t);
	}
	isDistinct(e, t) {
		return this.add(e, "isdistinct", t);
	}
	not(e, t, n) {
		return this.add(e, t, n, !0);
	}
	build() {
		return this.filters.join(",");
	}
	toString() {
		return this.build();
	}
}, ut;
(function(e) {
	e.ALL = "*", e.INSERT = "INSERT", e.UPDATE = "UPDATE", e.DELETE = "DELETE";
})(ut ||= {});
var dt;
(function(e) {
	e.BROADCAST = "broadcast", e.PRESENCE = "presence", e.POSTGRES_CHANGES = "postgres_changes", e.SYSTEM = "system";
})(dt ||= {});
var w;
(function(e) {
	e.SUBSCRIBED = "SUBSCRIBED", e.TIMED_OUT = "TIMED_OUT", e.CLOSED = "CLOSED", e.CHANNEL_ERROR = "CHANNEL_ERROR";
})(w ||= {});
var ft = class e {
	get state() {
		return this.channelAdapter.state;
	}
	set state(e) {
		this.channelAdapter.state = e;
	}
	get joinedOnce() {
		return this.channelAdapter.joinedOnce;
	}
	get timeout() {
		return this.socket.timeout;
	}
	get joinPush() {
		return this.channelAdapter.joinPush;
	}
	get rejoinTimer() {
		return this.channelAdapter.rejoinTimer;
	}
	constructor(e, t = { config: {} }, n) {
		if (this.topic = e, this.params = t, this.socket = n, this.bindings = {}, this.subTopic = e.replace(/^realtime:/i, ""), this.params.config = Object.assign({
			broadcast: {
				ack: !1,
				self: !1
			},
			presence: {
				key: "",
				enabled: !1
			},
			private: !1
		}, t.config), this.channelAdapter = new tt(this.socket.socketAdapter, e, this.params), this.presence = new $e(this), this._onClose(() => {
			this.socket._remove(this);
		}), this._updateFilterTransform(), this.broadcastEndpointURL = Oe(this.socket.socketAdapter.endPointURL()), this.private = this.params.config.private || !1, !this.private && this.params.config?.broadcast?.replay) throw Error(`tried to use replay on public channel '${this.topic}'. It must be a private channel.`);
	}
	subscribe(e, t = this.timeout) {
		if (this.socket.isConnected() || this.socket.connect(), this.channelAdapter.isClosed()) {
			let { config: { broadcast: n, presence: r, private: i } } = this.params, a = this.bindings.postgres_changes?.map((e) => e.filter) ?? [], o = !!this.bindings[dt.PRESENCE] && this.bindings[dt.PRESENCE].length > 0 || this.params.config.presence?.enabled === !0, s = {}, c = {
				broadcast: n,
				presence: Object.assign(Object.assign({}, r), { enabled: o }),
				postgres_changes: a,
				private: i
			};
			this.socket.accessTokenValue && (s.access_token = this.socket.accessTokenValue), this._onError((t) => {
				e?.(w.CHANNEL_ERROR, et(t));
			}), this._onClose(() => e?.(w.CLOSED)), this.updateJoinPayload(Object.assign({ config: c }, s)), this._updateFilterMessage(), this.channelAdapter.subscribe(t).receive("ok", async ({ postgres_changes: t }) => {
				if (this.socket._isManualToken() || this.socket.setAuth(), t === void 0) {
					e?.(w.SUBSCRIBED);
					return;
				}
				this._updatePostgresBindings(t, e);
			}).receive("error", (t) => {
				this.state = v.errored;
				let n = Object.values(t).join(", ") || "error";
				e?.(w.CHANNEL_ERROR, Error(n, { cause: t }));
			}).receive("timeout", () => {
				e?.(w.TIMED_OUT);
			});
		}
		return this;
	}
	_updatePostgresBindings(t, n) {
		let r = this.bindings.postgres_changes, i = r?.length ?? 0, a = [];
		for (let o = 0; o < i; o++) {
			let i = r[o], { filter: { event: s, schema: c, table: l, filter: u } } = i, d = t && t[o];
			if (d && d.event === s && e.isFilterValueEqual(d.schema, c) && e.isFilterValueEqual(d.table, l) && e.isFilterValueEqual(d.filter, u)) a.push(Object.assign(Object.assign({}, i), { id: d.id }));
			else {
				this.unsubscribe(), this.state = v.errored, n?.(w.CHANNEL_ERROR, /* @__PURE__ */ Error("mismatch between server and client bindings for postgres changes"));
				return;
			}
		}
		this.bindings.postgres_changes = a, this.state != v.errored && n && n(w.SUBSCRIBED);
	}
	presenceState() {
		return this.presence.state;
	}
	async track(e, t = {}) {
		return await this.send({
			type: "presence",
			event: "track",
			payload: e
		}, t.timeout || this.timeout);
	}
	async untrack(e = {}) {
		return await this.send({
			type: "presence",
			event: "untrack"
		}, e);
	}
	on(e, t, n) {
		let r = this.channelAdapter.isJoined() || this.channelAdapter.isJoining(), i = e === dt.PRESENCE || e === dt.POSTGRES_CHANGES;
		if (r && i) throw this.socket.log("channel", `cannot add \`${e}\` callbacks for ${this.topic} after \`subscribe()\`.`), Error(`cannot add \`${e}\` callbacks for ${this.topic} after \`subscribe()\`.`);
		return this._on(e, t, n);
	}
	async httpSend(e, t, n = {}) {
		if (t == null) return Promise.reject(/* @__PURE__ */ Error("Payload is required for httpSend()"));
		let r = t instanceof ArrayBuffer || ArrayBuffer.isView(t), i = {
			apikey: this.socket.apiKey ? this.socket.apiKey : "",
			"Content-Type": r ? "application/octet-stream" : "application/json"
		};
		this.socket.accessTokenValue && (i.Authorization = `Bearer ${this.socket.accessTokenValue}`);
		let a = new URL(this.broadcastEndpointURL);
		a.pathname += `/${encodeURIComponent(this.subTopic)}/events/${encodeURIComponent(e)}`, this.private && a.searchParams.set("private", "true");
		let o = {
			method: "POST",
			headers: i,
			body: r ? t : JSON.stringify(t)
		}, s = await this._fetchWithTimeout(a.toString(), o, n.timeout ?? this.timeout);
		if (s.status === 202) return { success: !0 };
		if (s.status === 404) return Promise.reject(/* @__PURE__ */ Error("httpSend() requires Realtime server v2.97.0 or newer; the endpoint returned 404. Update your Supabase CLI to a recent version, or upgrade the Realtime server in your self-hosted setup. See https://github.com/supabase/supabase-js/blob/master/packages/core/realtime-js/migrations/httpsend-server-version.md"));
		let c = s.statusText;
		try {
			let e = await s.json();
			c = e.error || e.message || c;
		} catch {}
		return Promise.reject(Error(c));
	}
	async send(e, t = {}) {
		if (!this.channelAdapter.canPush() && e.type === "broadcast") {
			console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");
			let { event: n, payload: r } = e, i = {
				apikey: this.socket.apiKey ? this.socket.apiKey : "",
				"Content-Type": "application/json"
			};
			this.socket.accessTokenValue && (i.Authorization = `Bearer ${this.socket.accessTokenValue}`);
			let a = {
				method: "POST",
				headers: i,
				body: JSON.stringify({ messages: [{
					topic: this.subTopic,
					event: n,
					payload: r,
					private: this.private
				}] })
			};
			try {
				let e = await this._fetchWithTimeout(this.broadcastEndpointURL, a, t.timeout ?? this.timeout);
				return await e.body?.cancel(), e.ok ? "ok" : "error";
			} catch (e) {
				return e instanceof Error && e.name === "AbortError" ? "timed out" : "error";
			}
		} else return new Promise((n) => {
			let r = this.channelAdapter.push(e.type, e, t.timeout || this.timeout);
			e.type === "broadcast" && !this.params?.config?.broadcast?.ack && n("ok"), r.receive("ok", () => n("ok")), r.receive("error", () => n("error")), r.receive("timeout", () => n("timed out"));
		});
	}
	updateJoinPayload(e) {
		this.channelAdapter.updateJoinPayload(e);
	}
	async unsubscribe(e = this.timeout) {
		return new Promise((t) => {
			this.channelAdapter.unsubscribe(e).receive("ok", () => t("ok")).receive("timeout", () => t("timed out")).receive("error", () => t("error"));
		});
	}
	teardown() {
		this.channelAdapter.teardown();
	}
	async _fetchWithTimeout(e, t, n) {
		let r = new AbortController(), i = setTimeout(() => r.abort(), n), a = await this.socket.fetch(e, Object.assign(Object.assign({}, t), { signal: r.signal }));
		return clearTimeout(i), a;
	}
	_on(e, t, n) {
		let r = e.toLocaleLowerCase(), i = t?.filter;
		(i instanceof lt || typeof i == "object" && i && typeof i.build == "function") && (t = Object.assign(Object.assign({}, t), { filter: i.build() }));
		let a = this.channelAdapter.on(e, n), o = {
			type: r,
			filter: t,
			callback: n,
			ref: a
		};
		return this.bindings[r] ? this.bindings[r].push(o) : this.bindings[r] = [o], this._updateFilterMessage(), this;
	}
	_onClose(e) {
		this.channelAdapter.onClose(e);
	}
	_onError(e) {
		this.channelAdapter.onError(e);
	}
	_updateFilterMessage() {
		this.channelAdapter.updateFilterBindings((e, t, n) => {
			let r = e.event.toLocaleLowerCase();
			if (this._notThisChannelEvent(r, n)) return !1;
			let i = this.bindings[r]?.find((t) => t.ref === e.ref);
			if (!i) return !0;
			if ([
				"broadcast",
				"presence",
				"postgres_changes"
			].includes(r)) if ("id" in i) {
				let e = i.id, n = i.filter?.event;
				return e && t.ids?.includes(e) && (n === "*" || n?.toLocaleLowerCase() === t.data?.type.toLocaleLowerCase());
			} else {
				let e = (i?.filter?.event)?.toLocaleLowerCase();
				return e === "*" || e === (t?.event)?.toLocaleLowerCase();
			}
			else return i.type.toLocaleLowerCase() === r;
		});
	}
	_notThisChannelEvent(e, t) {
		let { close: n, error: r, leave: i, join: a } = ge;
		return t && [
			n,
			r,
			i,
			a
		].includes(e) && t !== this.joinPush.ref;
	}
	_updateFilterTransform() {
		this.channelAdapter.updatePayloadTransform((e, t, n) => {
			if (typeof t == "object" && "ids" in t) {
				let e = t.data, { schema: n, table: r, commit_timestamp: i, type: a, errors: o } = e;
				return Object.assign(Object.assign({}, {
					schema: n,
					table: r,
					commit_timestamp: i,
					eventType: a,
					new: {},
					old: {},
					errors: o
				}), this._getPayloadRecords(e));
			}
			return t;
		});
	}
	copyBindings(e) {
		if (this.joinedOnce) throw Error("cannot copy bindings into joined channel");
		for (let t in e.bindings) for (let n of e.bindings[t]) this._on(n.type, n.filter, n.callback);
	}
	static isFilterValueEqual(e, t) {
		return (e ?? void 0) === (t ?? void 0);
	}
	_getPayloadRecords(e) {
		let t = {
			new: {},
			old: {}
		};
		return (e.type === "INSERT" || e.type === "UPDATE") && (t.new = ye(e.columns, e.record)), (e.type === "UPDATE" || e.type === "DELETE") && (t.old = ye(e.columns, e.old_record)), t;
	}
}, pt = class {
	constructor(e, t) {
		this.socket = new Ke(e, t);
	}
	get timeout() {
		return this.socket.timeout;
	}
	get endPoint() {
		return this.socket.endPoint;
	}
	get transport() {
		return this.socket.transport;
	}
	get heartbeatIntervalMs() {
		return this.socket.heartbeatIntervalMs;
	}
	get heartbeatCallback() {
		return this.socket.heartbeatCallback;
	}
	set heartbeatCallback(e) {
		this.socket.heartbeatCallback = e;
	}
	get heartbeatTimer() {
		return this.socket.heartbeatTimer;
	}
	get pendingHeartbeatRef() {
		return this.socket.pendingHeartbeatRef;
	}
	get reconnectTimer() {
		return this.socket.reconnectTimer;
	}
	get vsn() {
		return this.socket.vsn;
	}
	get encode() {
		return this.socket.encode;
	}
	get decode() {
		return this.socket.decode;
	}
	get reconnectAfterMs() {
		return this.socket.reconnectAfterMs;
	}
	get sendBuffer() {
		return this.socket.sendBuffer;
	}
	get stateChangeCallbacks() {
		return this.socket.stateChangeCallbacks;
	}
	connect() {
		this.socket.connect();
	}
	disconnect(e, t, n, r = 1e4) {
		return new Promise((i) => {
			setTimeout(() => i("timeout"), r), this.socket.disconnect(() => {
				e(), i("ok");
			}, t, n);
		});
	}
	push(e) {
		this.socket.push(e);
	}
	log(e, t, n) {
		this.socket.log(e, t, n);
	}
	makeRef() {
		return this.socket.makeRef();
	}
	onOpen(e) {
		this.socket.onOpen(e);
	}
	onClose(e) {
		this.socket.onClose(e);
	}
	onError(e) {
		this.socket.onError(e);
	}
	onMessage(e) {
		this.socket.onMessage(e);
	}
	isConnected() {
		return this.socket.isConnected();
	}
	isConnecting() {
		return this.socket.connectionState() == _e.connecting;
	}
	isDisconnecting() {
		return this.socket.connectionState() == _e.closing;
	}
	connectionState() {
		return this.socket.connectionState();
	}
	endPointURL() {
		return this.socket.endPointURL();
	}
	sendHeartbeat() {
		this.socket.sendHeartbeat();
	}
	getSocket() {
		return this.socket;
	}
}, mt = {
	HEARTBEAT_INTERVAL: 25e3,
	RECONNECT_DELAY: 10,
	HEARTBEAT_TIMEOUT_FALLBACK: 100
}, ht = [
	1e3,
	2e3,
	5e3,
	1e4
], gt = 1e4;
function _t() {
	let e = /* @__PURE__ */ new Map();
	return {
		get length() {
			return e.size;
		},
		clear() {
			e.clear();
		},
		getItem(t) {
			return e.has(t) ? e.get(t) : null;
		},
		key(t) {
			return Array.from(e.keys())[t] ?? null;
		},
		removeItem(t) {
			e.delete(t);
		},
		setItem(t, n) {
			e.set(t, String(n));
		}
	};
}
function vt() {
	try {
		if (typeof globalThis < "u" && globalThis.sessionStorage) return globalThis.sessionStorage;
	} catch {}
	return _t();
}
var yt = "\n  addEventListener(\"message\", (e) => {\n    if (e.data.event === \"start\") {\n      setInterval(() => postMessage({ event: \"keepAlive\" }), e.data.interval);\n    }\n  });", bt = class {
	get endPoint() {
		return this.socketAdapter.endPoint;
	}
	get timeout() {
		return this.socketAdapter.timeout;
	}
	get transport() {
		return this.socketAdapter.transport;
	}
	get heartbeatCallback() {
		return this.socketAdapter.heartbeatCallback;
	}
	get heartbeatIntervalMs() {
		return this.socketAdapter.heartbeatIntervalMs;
	}
	get heartbeatTimer() {
		return this.worker ? this._workerHeartbeatTimer : this.socketAdapter.heartbeatTimer;
	}
	get pendingHeartbeatRef() {
		return this.worker ? this._pendingWorkerHeartbeatRef : this.socketAdapter.pendingHeartbeatRef;
	}
	get reconnectTimer() {
		return this.socketAdapter.reconnectTimer;
	}
	get vsn() {
		return this.socketAdapter.vsn;
	}
	get encode() {
		return this.socketAdapter.encode;
	}
	get decode() {
		return this.socketAdapter.decode;
	}
	get reconnectAfterMs() {
		return this.socketAdapter.reconnectAfterMs;
	}
	get sendBuffer() {
		return this.socketAdapter.sendBuffer;
	}
	get stateChangeCallbacks() {
		return this.socketAdapter.stateChangeCallbacks;
	}
	constructor(e, t) {
		if (this.channels = [], this.accessTokenValue = null, this.accessToken = null, this.apiKey = null, this.httpEndpoint = "", this.headers = {}, this.params = {}, this.ref = 0, this.serializer = new ve(), this._manuallySetToken = !1, this._authPromise = null, this._workerHeartbeatTimer = void 0, this._pendingWorkerHeartbeatRef = null, this._pendingDisconnectTimer = null, this._disconnectOnEmptyChannelsAfterMs = 0, this._resolveFetch = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), !t?.params?.apikey) throw Error("API key is required to connect to Realtime");
		this.apiKey = t.params.apikey;
		let n = this._initializeOptions(t);
		this.socketAdapter = new pt(e, n), this.httpEndpoint = Oe(e), this.fetch = this._resolveFetch(t?.fetch);
	}
	connect() {
		if (!(this.isConnecting() || this.isDisconnecting() || this.isConnected())) {
			this.accessToken && !this._authPromise && this._setAuthSafely("connect"), this._setupConnectionHandlers();
			try {
				this.socketAdapter.connect();
			} catch (e) {
				let t = e.message;
				throw Error(`WebSocket not available: ${t}`);
			}
			this._handleNodeJsRaceCondition();
		}
	}
	endpointURL() {
		return this.socketAdapter.endPointURL();
	}
	async disconnect(e, t) {
		return this._cancelPendingDisconnect(), this.isDisconnecting() ? "ok" : await this.socketAdapter.disconnect(() => {
			clearInterval(this._workerHeartbeatTimer), this._terminateWorker();
		}, e, t);
	}
	getChannels() {
		return this.channels;
	}
	async removeChannel(e) {
		let t = await e.unsubscribe();
		return t === "ok" && e.teardown(), t;
	}
	async removeAllChannels() {
		let e = this.channels.map(async (e) => {
			let t = await e.unsubscribe();
			return e.teardown(), t;
		}), t = await Promise.all(e);
		return await this.disconnect(), t;
	}
	log(e, t, n) {
		this.socketAdapter.log(e, t, n);
	}
	connectionState() {
		return this.socketAdapter.connectionState() || _e.closed;
	}
	isConnected() {
		return this.socketAdapter.isConnected();
	}
	isConnecting() {
		return this.socketAdapter.isConnecting();
	}
	isDisconnecting() {
		return this.socketAdapter.isDisconnecting();
	}
	channel(e, t = { config: {} }) {
		let n = `realtime:${e}`, r = this.getChannels().find((e) => e.topic === n);
		if (r) return r;
		{
			let n = new ft(`realtime:${e}`, t, this);
			return this._cancelPendingDisconnect(), this.channels.push(n), n;
		}
	}
	push(e) {
		this.socketAdapter.push(e);
	}
	async setAuth(e = null) {
		this._authPromise = this._performAuth(e);
		try {
			await this._authPromise;
		} finally {
			this._authPromise = null;
		}
	}
	_isManualToken() {
		return this._manuallySetToken;
	}
	async sendHeartbeat() {
		this.socketAdapter.sendHeartbeat();
	}
	onHeartbeat(e) {
		this.socketAdapter.heartbeatCallback = this._wrapHeartbeatCallback(e);
	}
	_makeRef() {
		return this.socketAdapter.makeRef();
	}
	_remove(e) {
		this.channels = this.channels.filter((t) => t.topic !== e.topic), this.channels.length === 0 && (this.log("transport", "no channels remaining, scheduling disconnect"), this._schedulePendingDisconnect());
	}
	_schedulePendingDisconnect() {
		if (this._cancelPendingDisconnect(), this._disconnectOnEmptyChannelsAfterMs === 0) {
			this.log("transport", "disconnecting immediately - no channels"), this.disconnect();
			return;
		}
		this._pendingDisconnectTimer = setTimeout(() => {
			this._pendingDisconnectTimer = null, this.channels.length === 0 && (this.log("transport", "deferred disconnect fired - no channels, disconnecting"), this.disconnect());
		}, this._disconnectOnEmptyChannelsAfterMs), this.log("transport", `deferred disconnect scheduled in ${this._disconnectOnEmptyChannelsAfterMs}ms`);
	}
	_cancelPendingDisconnect() {
		this._pendingDisconnectTimer !== null && (this.log("transport", "pending disconnect cancelled - channel activity detected"), clearTimeout(this._pendingDisconnectTimer), this._pendingDisconnectTimer = null);
	}
	async _performAuth(e = null) {
		let t, n = !1;
		if (e) t = e, n = !0;
		else if (this.accessToken) try {
			t = await this.accessToken();
		} catch (e) {
			this.log("error", "Error fetching access token from callback", e), t = this.accessTokenValue;
		}
		else t = this.accessTokenValue;
		n ? this._manuallySetToken = !0 : this.accessToken && (this._manuallySetToken = !1), this.accessTokenValue != t && (this.accessTokenValue = t, this.channels.forEach((e) => {
			let n = {
				access_token: t,
				version: de
			};
			t && e.updateJoinPayload(n), e.joinedOnce && e.channelAdapter.isJoined() && e.channelAdapter.push(ge.access_token, { access_token: t });
		}));
	}
	async _waitForAuthIfNeeded() {
		this._authPromise && await this._authPromise;
	}
	_setAuthSafely(e = "general") {
		this._isManualToken() || this.setAuth().catch((t) => {
			this.log("error", `Error setting auth in ${e}`, t);
		});
	}
	_setupConnectionHandlers() {
		this.socketAdapter.onOpen(() => {
			(this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve())).catch((e) => {
				this.log("error", "error waiting for auth on connect", e);
			}), this.worker && !this.workerRef && this._startWorkerHeartbeat();
		}), this.socketAdapter.onClose(() => {
			this.worker && this.workerRef && this._terminateWorker();
		}), this.socketAdapter.onMessage((e) => {
			e.ref && e.ref === this._pendingWorkerHeartbeatRef && (this._pendingWorkerHeartbeatRef = null);
		});
	}
	_handleNodeJsRaceCondition() {
		this.socketAdapter.isConnected() && this.socketAdapter.getSocket().onConnOpen();
	}
	_wrapHeartbeatCallback(e) {
		return (t, n) => {
			t !== "disconnected" && (t == "sent" && this._setAuthSafely(), e && e(t, n));
		};
	}
	_startWorkerHeartbeat() {
		this.workerUrl ? this.log("worker", `starting worker for from ${this.workerUrl}`) : this.log("worker", "starting default worker");
		let e = this._workerObjectUrl(this.workerUrl);
		this.workerRef = new Worker(e), this.workerRef.onerror = (e) => {
			this.log("worker", "worker error", e.message), this._terminateWorker(), this.disconnect();
		}, this.workerRef.onmessage = (e) => {
			e.data.event === "keepAlive" && this.sendHeartbeat();
		}, this.workerRef.postMessage({
			event: "start",
			interval: this.heartbeatIntervalMs
		});
	}
	_terminateWorker() {
		this.workerRef &&= (this.log("worker", "terminating worker"), this.workerRef.terminate(), void 0);
	}
	_workerObjectUrl(e) {
		let t;
		if (e) t = e;
		else {
			let e = new Blob([yt], { type: "application/javascript" });
			t = URL.createObjectURL(e);
		}
		return t;
	}
	_initializeOptions(e) {
		this.worker = e?.worker ?? !1, this.accessToken = e?.accessToken ?? null;
		let t = {};
		t.timeout = e?.timeout ?? he, t.heartbeatIntervalMs = e?.heartbeatIntervalMs ?? mt.HEARTBEAT_INTERVAL, this._disconnectOnEmptyChannelsAfterMs = e?.disconnectOnEmptyChannelsAfterMs ?? 2 * (e?.heartbeatIntervalMs ?? mt.HEARTBEAT_INTERVAL), t.transport = e?.transport ?? ue.getWebSocketConstructor(), t.params = e?.params, t.logger = e?.logger, t.heartbeatCallback = this._wrapHeartbeatCallback(e?.heartbeatCallback), t.sessionStorage = e?.sessionStorage ?? vt(), t.reconnectAfterMs = e?.reconnectAfterMs ?? ((e) => ht[e - 1] || gt);
		let n, r, i = e?.vsn ?? me;
		switch (i) {
			case fe:
				n = (e, t) => t(JSON.stringify(e)), r = (e, t) => t(JSON.parse(e));
				break;
			case pe:
				n = this.serializer.encode.bind(this.serializer), r = this.serializer.decode.bind(this.serializer);
				break;
			default: throw Error(`Unsupported serializer version: ${t.vsn}`);
		}
		if (t.vsn = i, t.encode = e?.encode ?? n, t.decode = e?.decode ?? r, t.beforeReconnect = this._reconnectAuth.bind(this), (e?.logLevel || e?.log_level) && (this.logLevel = e.logLevel || e.log_level, t.params = Object.assign(Object.assign({}, t.params), { log_level: this.logLevel })), this.worker) {
			if (typeof window < "u" && !window.Worker) throw Error("Web Worker is not supported");
			this.workerUrl = e?.workerUrl, t.autoSendHeartbeat = !this.worker;
		}
		return t;
	}
	async _reconnectAuth() {
		await this._waitForAuthIfNeeded(), this.isConnected() || this.connect();
	}
}, xt = class extends Error {
	constructor(e, t) {
		super(e), this.name = "IcebergError", this.status = t.status, this.icebergType = t.icebergType, this.icebergCode = t.icebergCode, this.details = t.details, this.isCommitStateUnknown = t.icebergType === "CommitStateUnknownException" || [
			500,
			502,
			504
		].includes(t.status) && t.icebergType?.includes("CommitState") === !0;
	}
	isNotFound() {
		return this.status === 404;
	}
	isConflict() {
		return this.status === 409;
	}
	isAuthenticationTimeout() {
		return this.status === 419;
	}
};
function St(e, t, n) {
	let r = new URL(t, e);
	if (n) for (let [e, t] of Object.entries(n)) t !== void 0 && r.searchParams.set(e, t);
	return r.toString();
}
async function Ct(e) {
	return !e || e.type === "none" ? {} : e.type === "bearer" ? { Authorization: `Bearer ${e.token}` } : e.type === "header" ? { [e.name]: e.value } : e.type === "custom" ? await e.getHeaders() : {};
}
function wt(e) {
	let t = e.fetchImpl ?? globalThis.fetch;
	return { async request({ method: n, path: r, query: i, body: a, headers: o }) {
		let s = St(e.baseUrl, r, i), c = await Ct(e.auth), l = await t(s, {
			method: n,
			headers: {
				...a ? { "Content-Type": "application/json" } : {},
				...c,
				...o
			},
			body: a ? JSON.stringify(a) : void 0
		}), u = await l.text(), d = (l.headers.get("content-type") || "").includes("application/json"), f = d && u ? JSON.parse(u) : u;
		if (!l.ok) {
			let e = d ? f : void 0, t = e?.error;
			throw new xt(t?.message ?? `Request failed with status ${l.status}`, {
				status: l.status,
				icebergType: t?.type,
				icebergCode: t?.code,
				details: e
			});
		}
		return {
			status: l.status,
			headers: l.headers,
			data: f
		};
	} };
}
function Tt(e) {
	return e.join("");
}
var Et = class {
	constructor(e, t = "") {
		this.client = e, this.prefix = t;
	}
	async listNamespaces(e) {
		let t = e ? { parent: Tt(e.namespace) } : void 0;
		return (await this.client.request({
			method: "GET",
			path: `${this.prefix}/namespaces`,
			query: t
		})).data.namespaces.map((e) => ({ namespace: e }));
	}
	async createNamespace(e, t) {
		let n = {
			namespace: e.namespace,
			properties: t?.properties
		};
		return (await this.client.request({
			method: "POST",
			path: `${this.prefix}/namespaces`,
			body: n
		})).data;
	}
	async dropNamespace(e) {
		await this.client.request({
			method: "DELETE",
			path: `${this.prefix}/namespaces/${Tt(e.namespace)}`
		});
	}
	async loadNamespaceMetadata(e) {
		return { properties: (await this.client.request({
			method: "GET",
			path: `${this.prefix}/namespaces/${Tt(e.namespace)}`
		})).data.properties };
	}
	async namespaceExists(e) {
		try {
			return await this.client.request({
				method: "HEAD",
				path: `${this.prefix}/namespaces/${Tt(e.namespace)}`
			}), !0;
		} catch (e) {
			if (e instanceof xt && e.status === 404) return !1;
			throw e;
		}
	}
	async createNamespaceIfNotExists(e, t) {
		try {
			return await this.createNamespace(e, t);
		} catch (e) {
			if (e instanceof xt && e.status === 409) return;
			throw e;
		}
	}
};
function Dt(e) {
	return e.join("");
}
var Ot = class {
	constructor(e, t = "", n) {
		this.client = e, this.prefix = t, this.accessDelegation = n;
	}
	async listTables(e) {
		return (await this.client.request({
			method: "GET",
			path: `${this.prefix}/namespaces/${Dt(e.namespace)}/tables`
		})).data.identifiers;
	}
	async createTable(e, t) {
		let n = {};
		return this.accessDelegation && (n["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({
			method: "POST",
			path: `${this.prefix}/namespaces/${Dt(e.namespace)}/tables`,
			body: t,
			headers: n
		})).data.metadata;
	}
	async updateTable(e, t) {
		let n = await this.client.request({
			method: "POST",
			path: `${this.prefix}/namespaces/${Dt(e.namespace)}/tables/${e.name}`,
			body: t
		});
		return {
			"metadata-location": n.data["metadata-location"],
			metadata: n.data.metadata
		};
	}
	async dropTable(e, t) {
		await this.client.request({
			method: "DELETE",
			path: `${this.prefix}/namespaces/${Dt(e.namespace)}/tables/${e.name}`,
			query: { purgeRequested: String(t?.purge ?? !1) }
		});
	}
	async loadTable(e) {
		let t = {};
		return this.accessDelegation && (t["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({
			method: "GET",
			path: `${this.prefix}/namespaces/${Dt(e.namespace)}/tables/${e.name}`,
			headers: t
		})).data.metadata;
	}
	async tableExists(e) {
		let t = {};
		this.accessDelegation && (t["X-Iceberg-Access-Delegation"] = this.accessDelegation);
		try {
			return await this.client.request({
				method: "HEAD",
				path: `${this.prefix}/namespaces/${Dt(e.namespace)}/tables/${e.name}`,
				headers: t
			}), !0;
		} catch (e) {
			if (e instanceof xt && e.status === 404) return !1;
			throw e;
		}
	}
	async createTableIfNotExists(e, t) {
		try {
			return await this.createTable(e, t);
		} catch (n) {
			if (n instanceof xt && n.status === 409) return await this.loadTable({
				namespace: e.namespace,
				name: t.name
			});
			throw n;
		}
	}
}, kt = class {
	constructor(e) {
		let t = "v1";
		e.catalogName && (t += `/${e.catalogName}`);
		let n = e.baseUrl.endsWith("/") ? e.baseUrl : `${e.baseUrl}/`;
		this.client = wt({
			baseUrl: n,
			auth: e.auth,
			fetchImpl: e.fetch
		}), this.accessDelegation = e.accessDelegation?.join(","), this.namespaceOps = new Et(this.client, t), this.tableOps = new Ot(this.client, t, this.accessDelegation);
	}
	async listNamespaces(e) {
		return this.namespaceOps.listNamespaces(e);
	}
	async createNamespace(e, t) {
		return this.namespaceOps.createNamespace(e, t);
	}
	async dropNamespace(e) {
		await this.namespaceOps.dropNamespace(e);
	}
	async loadNamespaceMetadata(e) {
		return this.namespaceOps.loadNamespaceMetadata(e);
	}
	async listTables(e) {
		return this.tableOps.listTables(e);
	}
	async createTable(e, t) {
		return this.tableOps.createTable(e, t);
	}
	async updateTable(e, t) {
		return this.tableOps.updateTable(e, t);
	}
	async dropTable(e, t) {
		await this.tableOps.dropTable(e, t);
	}
	async loadTable(e) {
		return this.tableOps.loadTable(e);
	}
	async namespaceExists(e) {
		return this.namespaceOps.namespaceExists(e);
	}
	async tableExists(e) {
		return this.tableOps.tableExists(e);
	}
	async createNamespaceIfNotExists(e, t) {
		return this.namespaceOps.createNamespaceIfNotExists(e, t);
	}
	async createTableIfNotExists(e, t) {
		return this.tableOps.createTableIfNotExists(e, t);
	}
};
//#endregion
//#region ../node_modules/@supabase/storage-js/dist/index.mjs
function At(e) {
	"@babel/helpers - typeof";
	return At = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, At(e);
}
function jt(e, t) {
	if (At(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (At(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Mt(e) {
	var t = jt(e, "string");
	return At(t) == "symbol" ? t : t + "";
}
function Nt(e, t, n) {
	return (t = Mt(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Pt(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function T(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Pt(Object(n), !0).forEach(function(t) {
			Nt(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pt(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
var Ft = class extends Error {
	constructor(e, t = "storage", n, r) {
		super(e), this.__isStorageError = !0, this.namespace = t, this.name = t === "vectors" ? "StorageVectorsError" : "StorageError", this.status = n, this.statusCode = r;
	}
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			status: this.status,
			statusCode: this.statusCode
		};
	}
};
function It(e) {
	return typeof e == "object" && !!e && "__isStorageError" in e;
}
var Lt = class extends Ft {
	constructor(e, t, n, r = "storage") {
		super(e, r, t, n), this.name = r === "vectors" ? "StorageVectorsApiError" : "StorageApiError", this.status = t, this.statusCode = n;
	}
	toJSON() {
		return T({}, super.toJSON());
	}
}, Rt = class extends Ft {
	constructor(e, t, n = "storage") {
		super(e, n), this.name = n === "vectors" ? "StorageVectorsUnknownError" : "StorageUnknownError", this.originalError = t;
	}
};
function zt(e, t, n) {
	let r = T({}, e), i = t.toLowerCase();
	for (let e of Object.keys(r)) e.toLowerCase() === i && delete r[e];
	return r[i] = n, r;
}
function Bt(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) t[n.toLowerCase()] = r;
	return t;
}
var Vt = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), Ht = (e) => {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}, Ut = (e) => {
	if (Array.isArray(e)) return e.map((e) => Ut(e));
	if (typeof e == "function" || e !== Object(e)) return e;
	let t = {};
	return Object.entries(e).forEach(([e, n]) => {
		let r = e.replace(/([-_][a-z])/gi, (e) => e.toUpperCase().replace(/[-_]/g, ""));
		t[r] = Ut(n);
	}), t;
}, Wt = (e) => !e || typeof e != "string" || e.length === 0 || e.length > 100 || e.trim() !== e || e.includes("/") || e.includes("\\") ? !1 : /^[\w!.\*'() &$@=;:+,?-]+$/.test(e), Gt = (e) => {
	if (typeof e == "object" && e) {
		let t = e;
		if (typeof t.msg == "string") return t.msg;
		if (typeof t.message == "string") return t.message;
		if (typeof t.error_description == "string") return t.error_description;
		if (typeof t.error == "string") return t.error;
		if (typeof t.error == "object" && t.error !== null) {
			let e = t.error;
			if (typeof e.message == "string") return e.message;
		}
	}
	return JSON.stringify(e);
}, Kt = async (e, t, n, r) => {
	if (typeof e == "object" && e && "json" in e && typeof e.json == "function") {
		let n = e, i = parseInt(String(n.status), 10);
		Number.isFinite(i) || (i = 500), n.json().then((e) => {
			let n = e?.statusCode || e?.code || i + "";
			t(new Lt(Gt(e), i, n, r));
		}).catch(() => {
			let e = i + "";
			t(new Lt(n.statusText || `HTTP ${i} error`, i, e, r));
		});
	} else t(new Rt(Gt(e), e, r));
}, qt = (e, t, n, r) => {
	let i = {
		method: e,
		headers: t?.headers || {}
	};
	if (e === "GET" || e === "HEAD" || !r) return T(T({}, i), n);
	if (Ht(r)) {
		let e = t?.headers || {}, n;
		for (let [t, r] of Object.entries(e)) t.toLowerCase() === "content-type" && (n = r);
		i.headers = zt(e, "Content-Type", n ?? "application/json"), i.body = JSON.stringify(r);
	} else i.body = r;
	return t?.duplex && (i.duplex = t.duplex), T(T({}, i), n);
};
async function Jt(e, t, n, r, i, a, o) {
	return new Promise((s, c) => {
		e(n, qt(t, r, i, a)).then((e) => {
			if (!e.ok) throw e;
			if (r?.noResolveJson) return e;
			if (o === "vectors") {
				let t = e.headers.get("content-type");
				if (e.headers.get("content-length") === "0" || e.status === 204 || !t || !t.includes("application/json")) return {};
			}
			return e.json();
		}).then((e) => s(e)).catch((e) => Kt(e, c, r, o));
	});
}
function Yt(e = "storage") {
	return {
		get: async (t, n, r, i) => Jt(t, "GET", n, r, i, void 0, e),
		post: async (t, n, r, i, a) => Jt(t, "POST", n, i, a, r, e),
		put: async (t, n, r, i, a) => Jt(t, "PUT", n, i, a, r, e),
		head: async (t, n, r, i) => Jt(t, "HEAD", n, T(T({}, r), {}, { noResolveJson: !0 }), i, void 0, e),
		remove: async (t, n, r, i, a) => Jt(t, "DELETE", n, i, a, r, e)
	};
}
var { get: Xt, post: E, put: Zt, head: Qt, remove: $t } = Yt("storage"), D = Yt("vectors"), en = class {
	constructor(e, t = {}, n, r = "storage") {
		this.shouldThrowOnError = !1, this.url = e, this.headers = Bt(t), this.fetch = Vt(n), this.namespace = r;
	}
	throwOnError() {
		return this.shouldThrowOnError = !0, this;
	}
	setHeader(e, t) {
		return this.headers = zt(this.headers, e, t), this;
	}
	async handleOperation(e) {
		var t = this;
		try {
			return {
				data: await e(),
				error: null
			};
		} catch (e) {
			if (t.shouldThrowOnError) throw e;
			if (It(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
}, tn = Symbol.toStringTag, nn = class {
	constructor(e, t) {
		this.downloadFn = e, this.shouldThrowOnError = t, this[tn] = "StreamDownloadBuilder", this.promise = null;
	}
	then(e, t) {
		return this.getPromise().then(e, t);
	}
	catch(e) {
		return this.getPromise().catch(e);
	}
	finally(e) {
		return this.getPromise().finally(e);
	}
	getPromise() {
		return this.promise ||= this.execute(), this.promise;
	}
	async execute() {
		var e = this;
		try {
			return {
				data: (await e.downloadFn()).body,
				error: null
			};
		} catch (t) {
			if (e.shouldThrowOnError) throw t;
			if (It(t)) return {
				data: null,
				error: t
			};
			throw t;
		}
	}
}, rn = Symbol.toStringTag, an = class {
	constructor(e, t) {
		this.downloadFn = e, this.shouldThrowOnError = t, this[rn] = "BlobDownloadBuilder", this.promise = null;
	}
	asStream() {
		return new nn(this.downloadFn, this.shouldThrowOnError);
	}
	then(e, t) {
		return this.getPromise().then(e, t);
	}
	catch(e) {
		return this.getPromise().catch(e);
	}
	finally(e) {
		return this.getPromise().finally(e);
	}
	getPromise() {
		return this.promise ||= this.execute(), this.promise;
	}
	async execute() {
		var e = this;
		try {
			return {
				data: await (await e.downloadFn()).blob(),
				error: null
			};
		} catch (t) {
			if (e.shouldThrowOnError) throw t;
			if (It(t)) return {
				data: null,
				error: t
			};
			throw t;
		}
	}
}, on = {
	limit: 100,
	offset: 0,
	sortBy: {
		column: "name",
		order: "asc"
	}
}, sn = {
	cacheControl: "3600",
	contentType: "text/plain;charset=UTF-8",
	upsert: !1
}, cn = class extends en {
	constructor(e, t = {}, n, r) {
		super(e, t, r, "storage"), this.bucketId = n;
	}
	async uploadOrUpdate(e, t, n, r) {
		var i = this;
		return i.handleOperation(async () => {
			let a, o = T(T({}, sn), r), s = T(T({}, i.headers), e === "POST" && { "x-upsert": String(o.upsert) }), c = o.metadata;
			if (typeof Blob < "u" && n instanceof Blob ? (a = new FormData(), a.append("cacheControl", o.cacheControl), c && a.append("metadata", i.encodeMetadata(c)), a.append("", n)) : typeof FormData < "u" && n instanceof FormData ? (a = n, a.has("cacheControl") || a.append("cacheControl", o.cacheControl), c && !a.has("metadata") && a.append("metadata", i.encodeMetadata(c))) : (a = n, s["cache-control"] = `max-age=${o.cacheControl}`, s["content-type"] = o.contentType, c && (s["x-metadata"] = i.toBase64(i.encodeMetadata(c))), (typeof ReadableStream < "u" && a instanceof ReadableStream || a && typeof a == "object" && "pipe" in a && typeof a.pipe == "function") && !o.duplex && (o.duplex = "half")), r?.headers) for (let [e, t] of Object.entries(r.headers)) s = zt(s, e, t);
			let l = i._removeEmptyFolders(t), u = i._getFinalPath(l), d = await (e == "PUT" ? Zt : E)(i.fetch, `${i.url}/object/${u}`, a, T({ headers: s }, o?.duplex ? { duplex: o.duplex } : {}));
			return {
				path: l,
				id: d.Id,
				fullPath: d.Key
			};
		});
	}
	async upload(e, t, n) {
		return this.uploadOrUpdate("POST", e, t, n);
	}
	async uploadToSignedUrl(e, t, n, r) {
		var i = this;
		let a = i._removeEmptyFolders(e), o = i._getFinalPath(a), s = new URL(i.url + `/object/upload/sign/${o}`);
		return s.searchParams.set("token", t), i.handleOperation(async () => {
			let e, t = T(T({}, sn), r), o = T(T({}, i.headers), { "x-upsert": String(t.upsert) }), c = t.metadata;
			if (typeof Blob < "u" && n instanceof Blob ? (e = new FormData(), e.append("cacheControl", t.cacheControl), c && e.append("metadata", i.encodeMetadata(c)), e.append("", n)) : typeof FormData < "u" && n instanceof FormData ? (e = n, e.has("cacheControl") || e.append("cacheControl", t.cacheControl), c && !e.has("metadata") && e.append("metadata", i.encodeMetadata(c))) : (e = n, o["cache-control"] = `max-age=${t.cacheControl}`, o["content-type"] = t.contentType, c && (o["x-metadata"] = i.toBase64(i.encodeMetadata(c))), (typeof ReadableStream < "u" && e instanceof ReadableStream || e && typeof e == "object" && "pipe" in e && typeof e.pipe == "function") && !t.duplex && (t.duplex = "half")), r?.headers) for (let [e, t] of Object.entries(r.headers)) o = zt(o, e, t);
			return {
				path: a,
				fullPath: (await Zt(i.fetch, s.toString(), e, T({ headers: o }, t?.duplex ? { duplex: t.duplex } : {}))).Key
			};
		});
	}
	async createSignedUploadUrl(e, t) {
		var n = this;
		return n.handleOperation(async () => {
			let r = n._getFinalPath(e), i = T({}, n.headers);
			t?.upsert && (i["x-upsert"] = "true");
			let a = await E(n.fetch, `${n.url}/object/upload/sign/${r}`, {}, { headers: i }), o = new URL(n.url + a.url), s = o.searchParams.get("token");
			if (!s) throw new Ft("No token returned by API");
			return {
				signedUrl: o.toString(),
				path: e,
				token: s
			};
		});
	}
	async update(e, t, n) {
		return this.uploadOrUpdate("PUT", e, t, n);
	}
	async move(e, t, n) {
		var r = this;
		return r.handleOperation(async () => await E(r.fetch, `${r.url}/object/move`, {
			bucketId: r.bucketId,
			sourceKey: e,
			destinationKey: t,
			destinationBucket: n?.destinationBucket
		}, { headers: r.headers }));
	}
	async copy(e, t, n) {
		var r = this;
		return r.handleOperation(async () => ({ path: (await E(r.fetch, `${r.url}/object/copy`, {
			bucketId: r.bucketId,
			sourceKey: e,
			destinationKey: t,
			destinationBucket: n?.destinationBucket
		}, { headers: r.headers })).Key }));
	}
	async createSignedUrl(e, t, n) {
		var r = this;
		return r.handleOperation(async () => {
			let i = r._getFinalPath(e), a = typeof n?.transform == "object" && n.transform !== null && Object.keys(n.transform).length > 0, o = await E(r.fetch, `${r.url}/object/sign/${i}`, T({ expiresIn: t }, a ? { transform: n.transform } : {}), { headers: r.headers }), s = new URLSearchParams();
			n?.download && s.set("download", n.download === !0 ? "" : n.download), n?.cacheNonce != null && s.set("cacheNonce", String(n.cacheNonce));
			let c = s.toString();
			return { signedUrl: encodeURI(`${r.url}${o.signedURL}${c ? `&${c}` : ""}`) };
		});
	}
	async createSignedUrls(e, t, n) {
		var r = this;
		return r.handleOperation(async () => {
			let i = await E(r.fetch, `${r.url}/object/sign/${r.bucketId}`, {
				expiresIn: t,
				paths: e
			}, { headers: r.headers }), a = new URLSearchParams();
			n?.download && a.set("download", n.download === !0 ? "" : n.download), n?.cacheNonce != null && a.set("cacheNonce", String(n.cacheNonce));
			let o = a.toString();
			return i.map((e) => T(T({}, e), {}, { signedUrl: e.signedURL ? encodeURI(`${r.url}${e.signedURL}${o ? `&${o}` : ""}`) : null }));
		});
	}
	download(e, t, n) {
		let r = typeof t?.transform == "object" && t.transform !== null && Object.keys(t.transform).length > 0 ? "render/image/authenticated" : "object", i = new URLSearchParams();
		t?.transform && this.applyTransformOptsToQuery(i, t.transform), t?.cacheNonce != null && i.set("cacheNonce", String(t.cacheNonce));
		let a = i.toString(), o = this._getFinalPath(e);
		return new an(() => Xt(this.fetch, `${this.url}/${r}/${o}${a ? `?${a}` : ""}`, {
			headers: this.headers,
			noResolveJson: !0
		}, n), this.shouldThrowOnError);
	}
	async info(e) {
		var t = this;
		let n = t._getFinalPath(e);
		return t.handleOperation(async () => Ut(await Xt(t.fetch, `${t.url}/object/info/${n}`, { headers: t.headers })));
	}
	async exists(e) {
		var t = this;
		let n = t._getFinalPath(e);
		try {
			return await Qt(t.fetch, `${t.url}/object/${n}`, { headers: t.headers }), {
				data: !0,
				error: null
			};
		} catch (e) {
			if (t.shouldThrowOnError) throw e;
			if (It(e)) {
				let t = e instanceof Lt ? e.status : e instanceof Rt ? e.originalError?.status : void 0;
				if (t !== void 0 && [400, 404].includes(t)) return {
					data: !1,
					error: e
				};
			}
			throw e;
		}
	}
	getPublicUrl(e, t) {
		let n = this._getFinalPath(e), r = new URLSearchParams();
		t?.download && r.set("download", t.download === !0 ? "" : t.download), t?.transform && this.applyTransformOptsToQuery(r, t.transform), t?.cacheNonce != null && r.set("cacheNonce", String(t.cacheNonce));
		let i = r.toString(), a = typeof t?.transform == "object" && t.transform !== null && Object.keys(t.transform).length > 0 ? "render/image" : "object";
		return { data: { publicUrl: encodeURI(`${this.url}/${a}/public/${n}`) + (i ? `?${i}` : "") } };
	}
	async remove(e) {
		var t = this;
		return t.handleOperation(async () => await $t(t.fetch, `${t.url}/object/${t.bucketId}`, { prefixes: e }, { headers: t.headers }));
	}
	async purgeCache(e, t, n) {
		var r = this;
		return r.handleOperation(async () => {
			let i = r._getFinalPath(e), a = new URLSearchParams();
			t?.transformations && a.set("transformations", "true");
			let o = a.toString();
			return await $t(r.fetch, `${r.url}/cdn/${i}${o ? `?${o}` : ""}`, {}, { headers: r.headers }, n);
		});
	}
	async list(e, t, n) {
		var r = this;
		return r.handleOperation(async () => {
			let i = t?.sortBy ? T(T({}, on.sortBy), t.sortBy) : on.sortBy, a = T(T(T({}, on), t), {}, {
				sortBy: i,
				prefix: e || ""
			});
			return await E(r.fetch, `${r.url}/object/list/${r.bucketId}`, a, { headers: r.headers }, n);
		});
	}
	async listV2(e, t) {
		var n = this;
		return n.handleOperation(async () => {
			let r = T({}, e);
			return await E(n.fetch, `${n.url}/object/list-v2/${n.bucketId}`, r, { headers: n.headers }, t);
		});
	}
	encodeMetadata(e) {
		return JSON.stringify(e);
	}
	toBase64(e) {
		return typeof Buffer < "u" ? Buffer.from(e).toString("base64") : btoa(e);
	}
	_getFinalPath(e) {
		return `${this.bucketId}/${e.replace(/^\/+/, "")}`;
	}
	_removeEmptyFolders(e) {
		return e.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
	}
	applyTransformOptsToQuery(e, t) {
		return t.width && e.set("width", t.width.toString()), t.height && e.set("height", t.height.toString()), t.resize && e.set("resize", t.resize), t.format && e.set("format", t.format), t.quality && e.set("quality", t.quality.toString()), e;
	}
}, ln = { "X-Client-Info": "storage-js/2.110.3" }, un = class extends en {
	constructor(e, t = {}, n, r) {
		let i = new URL(e);
		r?.useNewHostname && /supabase\.(co|in|red)$/.test(i.hostname) && !i.hostname.includes("storage.supabase.") && (i.hostname = i.hostname.replace("supabase.", "storage.supabase."));
		let a = i.href.replace(/\/$/, ""), o = T(T({}, ln), t);
		super(a, o, n, "storage");
	}
	async listBuckets(e) {
		var t = this;
		return t.handleOperation(async () => {
			let n = t.listBucketOptionsToQueryString(e);
			return await Xt(t.fetch, `${t.url}/bucket${n}`, { headers: t.headers });
		});
	}
	async getBucket(e) {
		var t = this;
		return t.handleOperation(async () => await Xt(t.fetch, `${t.url}/bucket/${e}`, { headers: t.headers }));
	}
	async createBucket(e, t = { public: !1 }) {
		var n = this;
		return n.handleOperation(async () => await E(n.fetch, `${n.url}/bucket`, {
			id: e,
			name: e,
			type: t.type,
			public: t.public,
			file_size_limit: t.fileSizeLimit,
			allowed_mime_types: t.allowedMimeTypes
		}, { headers: n.headers }));
	}
	async updateBucket(e, t) {
		var n = this;
		return n.handleOperation(async () => await Zt(n.fetch, `${n.url}/bucket/${e}`, {
			id: e,
			name: e,
			public: t.public,
			file_size_limit: t.fileSizeLimit,
			allowed_mime_types: t.allowedMimeTypes
		}, { headers: n.headers }));
	}
	async emptyBucket(e) {
		var t = this;
		return t.handleOperation(async () => await E(t.fetch, `${t.url}/bucket/${e}/empty`, {}, { headers: t.headers }));
	}
	async deleteBucket(e) {
		var t = this;
		return t.handleOperation(async () => await $t(t.fetch, `${t.url}/bucket/${e}`, {}, { headers: t.headers }));
	}
	async purgeBucketCache(e, t, n) {
		var r = this;
		return r.handleOperation(async () => {
			let i = new URLSearchParams();
			t?.transformations && i.set("transformations", "true");
			let a = i.toString();
			return await $t(r.fetch, `${r.url}/cdn/${e}${a ? `?${a}` : ""}`, {}, { headers: r.headers }, n);
		});
	}
	listBucketOptionsToQueryString(e) {
		let t = {};
		return e && ("limit" in e && (t.limit = String(e.limit)), "offset" in e && (t.offset = String(e.offset)), e.search && (t.search = e.search), e.sortColumn && (t.sortColumn = e.sortColumn), e.sortOrder && (t.sortOrder = e.sortOrder)), Object.keys(t).length > 0 ? "?" + new URLSearchParams(t).toString() : "";
	}
}, dn = class extends en {
	constructor(e, t = {}, n) {
		let r = e.replace(/\/$/, ""), i = T(T({}, ln), t);
		super(r, i, n, "storage");
	}
	async createBucket(e) {
		var t = this;
		return t.handleOperation(async () => await E(t.fetch, `${t.url}/bucket`, { name: e }, { headers: t.headers }));
	}
	async listBuckets(e) {
		var t = this;
		return t.handleOperation(async () => {
			let n = new URLSearchParams();
			e?.limit !== void 0 && n.set("limit", e.limit.toString()), e?.offset !== void 0 && n.set("offset", e.offset.toString()), e?.sortColumn && n.set("sortColumn", e.sortColumn), e?.sortOrder && n.set("sortOrder", e.sortOrder), e?.search && n.set("search", e.search);
			let r = n.toString(), i = r ? `${t.url}/bucket?${r}` : `${t.url}/bucket`;
			return await Xt(t.fetch, i, { headers: t.headers });
		});
	}
	async deleteBucket(e) {
		var t = this;
		return t.handleOperation(async () => await $t(t.fetch, `${t.url}/bucket/${e}`, {}, { headers: t.headers }));
	}
	from(e) {
		var t = this;
		if (!Wt(e)) throw new Ft("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
		let n = new kt({
			baseUrl: this.url,
			catalogName: e,
			auth: {
				type: "custom",
				getHeaders: async () => t.headers
			},
			fetch: this.fetch
		}), r = this.shouldThrowOnError;
		return new Proxy(n, { get(e, t) {
			let n = e[t];
			return typeof n == "function" ? async (...t) => {
				try {
					return {
						data: await n.apply(e, t),
						error: null
					};
				} catch (e) {
					if (r) throw e;
					return {
						data: null,
						error: e
					};
				}
			} : n;
		} });
	}
}, fn = class extends en {
	constructor(e, t = {}, n) {
		let r = e.replace(/\/$/, ""), i = T(T({}, ln), {}, { "Content-Type": "application/json" }, t);
		super(r, i, n, "vectors");
	}
	async createIndex(e) {
		var t = this;
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/CreateIndex`, e, { headers: t.headers }) || {});
	}
	async getIndex(e, t) {
		var n = this;
		return n.handleOperation(async () => await D.post(n.fetch, `${n.url}/GetIndex`, {
			vectorBucketName: e,
			indexName: t
		}, { headers: n.headers }));
	}
	async listIndexes(e) {
		var t = this;
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/ListIndexes`, e, { headers: t.headers }));
	}
	async deleteIndex(e, t) {
		var n = this;
		return n.handleOperation(async () => await D.post(n.fetch, `${n.url}/DeleteIndex`, {
			vectorBucketName: e,
			indexName: t
		}, { headers: n.headers }) || {});
	}
}, pn = class extends en {
	constructor(e, t = {}, n) {
		let r = e.replace(/\/$/, ""), i = T(T({}, ln), {}, { "Content-Type": "application/json" }, t);
		super(r, i, n, "vectors");
	}
	async putVectors(e) {
		var t = this;
		if (e.vectors.length < 1 || e.vectors.length > 500) throw Error("Vector batch size must be between 1 and 500 items");
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/PutVectors`, e, { headers: t.headers }) || {});
	}
	async getVectors(e) {
		var t = this;
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/GetVectors`, e, { headers: t.headers }));
	}
	async listVectors(e) {
		var t = this;
		if (e.segmentCount !== void 0) {
			if (e.segmentCount < 1 || e.segmentCount > 16) throw Error("segmentCount must be between 1 and 16");
			if (e.segmentIndex !== void 0 && (e.segmentIndex < 0 || e.segmentIndex >= e.segmentCount)) throw Error(`segmentIndex must be between 0 and ${e.segmentCount - 1}`);
		}
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/ListVectors`, e, { headers: t.headers }));
	}
	async queryVectors(e) {
		var t = this;
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/QueryVectors`, e, { headers: t.headers }));
	}
	async deleteVectors(e) {
		var t = this;
		if (e.keys.length < 1 || e.keys.length > 500) throw Error("Keys batch size must be between 1 and 500 items");
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/DeleteVectors`, e, { headers: t.headers }) || {});
	}
}, mn = class extends en {
	constructor(e, t = {}, n) {
		let r = e.replace(/\/$/, ""), i = T(T({}, ln), {}, { "Content-Type": "application/json" }, t);
		super(r, i, n, "vectors");
	}
	async createBucket(e) {
		var t = this;
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/CreateVectorBucket`, { vectorBucketName: e }, { headers: t.headers }) || {});
	}
	async getBucket(e) {
		var t = this;
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/GetVectorBucket`, { vectorBucketName: e }, { headers: t.headers }));
	}
	async listBuckets(e = {}) {
		var t = this;
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/ListVectorBuckets`, e, { headers: t.headers }));
	}
	async deleteBucket(e) {
		var t = this;
		return t.handleOperation(async () => await D.post(t.fetch, `${t.url}/DeleteVectorBucket`, { vectorBucketName: e }, { headers: t.headers }) || {});
	}
}, hn = class extends mn {
	constructor(e, t = {}) {
		super(e, t.headers || {}, t.fetch);
	}
	from(e) {
		return new gn(this.url, this.headers, e, this.fetch);
	}
	async createBucket(e) {
		var t = () => super.createBucket, n = this;
		return t().call(n, e);
	}
	async getBucket(e) {
		var t = () => super.getBucket, n = this;
		return t().call(n, e);
	}
	async listBuckets(e = {}) {
		var t = () => super.listBuckets, n = this;
		return t().call(n, e);
	}
	async deleteBucket(e) {
		var t = () => super.deleteBucket, n = this;
		return t().call(n, e);
	}
}, gn = class extends fn {
	constructor(e, t, n, r) {
		super(e, t, r), this.vectorBucketName = n;
	}
	async createIndex(e) {
		var t = () => super.createIndex, n = this;
		return t().call(n, T(T({}, e), {}, { vectorBucketName: n.vectorBucketName }));
	}
	async listIndexes(e = {}) {
		var t = () => super.listIndexes, n = this;
		return t().call(n, T(T({}, e), {}, { vectorBucketName: n.vectorBucketName }));
	}
	async getIndex(e) {
		var t = () => super.getIndex, n = this;
		return t().call(n, n.vectorBucketName, e);
	}
	async deleteIndex(e) {
		var t = () => super.deleteIndex, n = this;
		return t().call(n, n.vectorBucketName, e);
	}
	index(e) {
		return new _n(this.url, this.headers, this.vectorBucketName, e, this.fetch);
	}
}, _n = class extends pn {
	constructor(e, t, n, r, i) {
		super(e, t, i), this.vectorBucketName = n, this.indexName = r;
	}
	async putVectors(e) {
		var t = () => super.putVectors, n = this;
		return t().call(n, T(T({}, e), {}, {
			vectorBucketName: n.vectorBucketName,
			indexName: n.indexName
		}));
	}
	async getVectors(e) {
		var t = () => super.getVectors, n = this;
		return t().call(n, T(T({}, e), {}, {
			vectorBucketName: n.vectorBucketName,
			indexName: n.indexName
		}));
	}
	async listVectors(e = {}) {
		var t = () => super.listVectors, n = this;
		return t().call(n, T(T({}, e), {}, {
			vectorBucketName: n.vectorBucketName,
			indexName: n.indexName
		}));
	}
	async queryVectors(e) {
		var t = () => super.queryVectors, n = this;
		return t().call(n, T(T({}, e), {}, {
			vectorBucketName: n.vectorBucketName,
			indexName: n.indexName
		}));
	}
	async deleteVectors(e) {
		var t = () => super.deleteVectors, n = this;
		return t().call(n, T(T({}, e), {}, {
			vectorBucketName: n.vectorBucketName,
			indexName: n.indexName
		}));
	}
}, vn = class extends un {
	constructor(e, t = {}, n, r) {
		super(e, t, n, r);
	}
	from(e) {
		return new cn(this.url, this.headers, e, this.fetch);
	}
	get vectors() {
		return new hn(this.url + "/vector", {
			headers: this.headers,
			fetch: this.fetch
		});
	}
	get analytics() {
		return new dn(this.url + "/iceberg", this.headers, this.fetch);
	}
}, yn = "2.110.3", bn = 30 * 1e3, xn = 3 * bn, Sn = 2 * bn, Cn = "http://localhost:9999", wn = "supabase.auth.token", Tn = { "X-Client-Info": `gotrue-js/${yn}` }, En = "X-Supabase-Api-Version", Dn = { "2024-01-01": {
	timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
	name: "2024-01-01"
} }, On = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i, kn = class extends Error {
	constructor(e, t, n) {
		super(e), this.__isAuthError = !0, this.name = "AuthError", this.status = t, this.code = n;
	}
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			status: this.status,
			code: this.code
		};
	}
};
function O(e) {
	return typeof e == "object" && !!e && "__isAuthError" in e;
}
var An = class extends kn {
	constructor(e, t, n) {
		super(e, t, n), this.name = "AuthApiError", this.status = t, this.code = n;
	}
};
function jn(e) {
	return O(e) && e.name === "AuthApiError";
}
var k = class extends kn {
	constructor(e, t) {
		super(e), this.name = "AuthUnknownError", this.originalError = t;
	}
}, A = class extends kn {
	constructor(e, t, n, r) {
		super(e, n, r), this.name = t, this.status = n;
	}
}, j = class extends A {
	constructor() {
		super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
	}
};
function Mn(e) {
	return O(e) && e.name === "AuthSessionMissingError";
}
var Nn = class extends A {
	constructor() {
		super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
	}
}, Pn = class extends A {
	constructor(e) {
		super(e, "AuthInvalidCredentialsError", 400, void 0);
	}
}, Fn = class extends A {
	constructor(e, t = null) {
		super(e, "AuthImplicitGrantRedirectError", 500, void 0), this.details = null, this.details = t;
	}
	toJSON() {
		return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
	}
};
function In(e) {
	return O(e) && e.name === "AuthImplicitGrantRedirectError";
}
var Ln = class extends A {
	constructor(e, t = null) {
		super(e, "AuthPKCEGrantCodeExchangeError", 500, void 0), this.details = null, this.details = t;
	}
	toJSON() {
		return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
	}
}, Rn = class extends A {
	constructor() {
		super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.", "AuthPKCECodeVerifierMissingError", 400, "pkce_code_verifier_not_found");
	}
}, zn = class extends A {
	constructor(e, t) {
		super(e, "AuthRetryableFetchError", t, void 0);
	}
};
function Bn(e) {
	return O(e) && e.name === "AuthRetryableFetchError";
}
var Vn = class extends A {
	constructor(e = "Refresh result discarded: session state changed mid-flight (e.g., concurrent signOut)") {
		super(e, "AuthRefreshDiscardedError", 409, void 0);
	}
};
function Hn(e) {
	return O(e) && e.name === "AuthRefreshDiscardedError";
}
var Un = class extends A {
	constructor(e, t, n) {
		super(e, "AuthWeakPasswordError", t, "weak_password"), this.reasons = n;
	}
	toJSON() {
		return Object.assign(Object.assign({}, super.toJSON()), { reasons: this.reasons });
	}
}, Wn = class extends A {
	constructor(e) {
		super(e, "AuthInvalidJwtError", 400, "invalid_jwt");
	}
}, Gn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), Kn = " 	\n\r=".split(""), qn = (() => {
	let e = Array(128);
	for (let t = 0; t < e.length; t += 1) e[t] = -1;
	for (let t = 0; t < Kn.length; t += 1) e[Kn[t].charCodeAt(0)] = -2;
	for (let t = 0; t < Gn.length; t += 1) e[Gn[t].charCodeAt(0)] = t;
	return e;
})();
function Jn(e, t, n) {
	if (e !== null) for (t.queue = t.queue << 8 | e, t.queuedBits += 8; t.queuedBits >= 6;) n(Gn[t.queue >> t.queuedBits - 6 & 63]), t.queuedBits -= 6;
	else if (t.queuedBits > 0) for (t.queue <<= 6 - t.queuedBits, t.queuedBits = 6; t.queuedBits >= 6;) n(Gn[t.queue >> t.queuedBits - 6 & 63]), t.queuedBits -= 6;
}
function Yn(e, t, n) {
	let r = qn[e];
	if (r > -1) for (t.queue = t.queue << 6 | r, t.queuedBits += 6; t.queuedBits >= 8;) n(t.queue >> t.queuedBits - 8 & 255), t.queuedBits -= 8;
	else if (r === -2) return;
	else throw Error(`Invalid Base64-URL character "${String.fromCharCode(e)}"`);
}
function Xn(e) {
	let t = [], n = (e) => {
		t.push(String.fromCodePoint(e));
	}, r = {
		utf8seq: 0,
		codepoint: 0
	}, i = {
		queue: 0,
		queuedBits: 0
	}, a = (e) => {
		$n(e, r, n);
	};
	for (let t = 0; t < e.length; t += 1) Yn(e.charCodeAt(t), i, a);
	return t.join("");
}
function Zn(e, t) {
	if (e <= 127) {
		t(e);
		return;
	} else if (e <= 2047) {
		t(192 | e >> 6), t(128 | e & 63);
		return;
	} else if (e <= 65535) {
		t(224 | e >> 12), t(128 | e >> 6 & 63), t(128 | e & 63);
		return;
	} else if (e <= 1114111) {
		t(240 | e >> 18), t(128 | e >> 12 & 63), t(128 | e >> 6 & 63), t(128 | e & 63);
		return;
	}
	throw Error(`Unrecognized Unicode codepoint: ${e.toString(16)}`);
}
function Qn(e, t) {
	for (let n = 0; n < e.length; n += 1) {
		let r = e.charCodeAt(n);
		if (r > 55295 && r <= 56319) {
			let t = (r - 55296) * 1024 & 65535;
			r = (e.charCodeAt(n + 1) - 56320 & 65535 | t) + 65536, n += 1;
		}
		Zn(r, t);
	}
}
function $n(e, t, n) {
	if (t.utf8seq === 0) {
		if (e <= 127) {
			n(e);
			return;
		}
		for (let n = 1; n < 6; n += 1) if (!(e >> 7 - n & 1)) {
			t.utf8seq = n;
			break;
		}
		if (t.utf8seq === 2) t.codepoint = e & 31;
		else if (t.utf8seq === 3) t.codepoint = e & 15;
		else if (t.utf8seq === 4) t.codepoint = e & 7;
		else throw Error("Invalid UTF-8 sequence");
		--t.utf8seq;
	} else if (t.utf8seq > 0) {
		if (e <= 127) throw Error("Invalid UTF-8 sequence");
		t.codepoint = t.codepoint << 6 | e & 63, --t.utf8seq, t.utf8seq === 0 && n(t.codepoint);
	}
}
function er(e) {
	let t = [], n = {
		queue: 0,
		queuedBits: 0
	}, r = (e) => {
		t.push(e);
	};
	for (let t = 0; t < e.length; t += 1) Yn(e.charCodeAt(t), n, r);
	return new Uint8Array(t);
}
function tr(e) {
	let t = [];
	return Qn(e, (e) => t.push(e)), new Uint8Array(t);
}
function nr(e) {
	let t = [], n = {
		queue: 0,
		queuedBits: 0
	}, r = (e) => {
		t.push(e);
	};
	return e.forEach((e) => Jn(e, n, r)), Jn(null, n, r), t.join("");
}
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/helpers.js
function rr(e) {
	return Math.round(Date.now() / 1e3) + e;
}
function ir() {
	return Symbol("auth-callback");
}
var M = () => typeof window < "u" && typeof document < "u", ar = {
	tested: !1,
	writable: !1
}, or = () => {
	if (!M()) return !1;
	try {
		if (typeof globalThis.localStorage != "object") return !1;
	} catch {
		return !1;
	}
	if (ar.tested) return ar.writable;
	let e = `lswt-${Math.random()}${Math.random()}`;
	try {
		globalThis.localStorage.setItem(e, e), globalThis.localStorage.removeItem(e), ar.tested = !0, ar.writable = !0;
	} catch {
		ar.tested = !0, ar.writable = !1;
	}
	return ar.writable;
};
function sr(e) {
	let t = {}, n = new URL(e);
	if (n.hash && n.hash[0] === "#") try {
		new URLSearchParams(n.hash.substring(1)).forEach((e, n) => {
			t[n] = e;
		});
	} catch {}
	return n.searchParams.forEach((e, n) => {
		t[n] = e;
	}), t;
}
var cr = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), lr = (e) => typeof e == "object" && !!e && "status" in e && "ok" in e && "json" in e && typeof e.json == "function", ur = async (e, t, n) => {
	await e.setItem(t, JSON.stringify(n));
}, N = async (e, t) => {
	let n = await e.getItem(t);
	if (!n) return null;
	try {
		return JSON.parse(n);
	} catch {
		return null;
	}
}, P = async (e, t) => {
	await e.removeItem(t);
}, dr = class e {
	constructor() {
		this.promise = new e.promiseConstructor((e, t) => {
			this.resolve = e, this.reject = t;
		});
	}
};
dr.promiseConstructor = Promise;
function fr(e) {
	let t = e.split(".");
	if (t.length !== 3) throw new Wn("Invalid JWT structure");
	for (let e = 0; e < t.length; e++) if (!On.test(t[e])) throw new Wn("JWT not in base64url format");
	return {
		header: JSON.parse(Xn(t[0])),
		payload: JSON.parse(Xn(t[1])),
		signature: er(t[2]),
		raw: {
			header: t[0],
			payload: t[1]
		}
	};
}
async function pr(e) {
	return await new Promise((t) => {
		setTimeout(() => t(null), e);
	});
}
function mr(e, t) {
	return new Promise((n, r) => {
		(async () => {
			for (let i = 0; i < Infinity; i++) try {
				let r = await e(i);
				if (!t(i, null, r)) {
					n(r);
					return;
				}
			} catch (e) {
				if (!t(i, e)) {
					r(e);
					return;
				}
			}
		})();
	});
}
function hr(e) {
	return ("0" + e.toString(16)).substr(-2);
}
function gr() {
	let e = /* @__PURE__ */ new Uint32Array(56);
	if (typeof crypto > "u") {
		let e = "";
		for (let t = 0; t < 56; t++) e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~".charAt(Math.floor(Math.random() * 66));
		return e;
	}
	return crypto.getRandomValues(e), Array.from(e, hr).join("");
}
async function _r(e) {
	let t = new TextEncoder().encode(e), n = await crypto.subtle.digest("SHA-256", t), r = new Uint8Array(n);
	return Array.from(r).map((e) => String.fromCharCode(e)).join("");
}
async function vr(e) {
	if (!(typeof crypto < "u" && crypto.subtle !== void 0 && typeof TextEncoder < "u")) return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), e;
	let t = await _r(e);
	return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function F(e, t, n = !1) {
	let r = gr(), i = r;
	n && (i += "/recovery"), await ur(e, `${t}-code-verifier`, i);
	let a = await vr(r);
	return [a, r === a ? "plain" : "s256"];
}
var yr = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function br(e) {
	let t = e.headers.get(En);
	if (!t || !t.match(yr)) return null;
	try {
		return /* @__PURE__ */ new Date(`${t}T00:00:00.0Z`);
	} catch {
		return null;
	}
}
function xr(e) {
	if (!e) throw Error("Missing exp claim");
	if (e <= Math.floor(Date.now() / 1e3)) throw Error("JWT has expired");
}
function Sr(e) {
	switch (e) {
		case "RS256": return {
			name: "RSASSA-PKCS1-v1_5",
			hash: { name: "SHA-256" }
		};
		case "ES256": return {
			name: "ECDSA",
			namedCurve: "P-256",
			hash: { name: "SHA-256" }
		};
		default: throw Error("Invalid alg claim");
	}
}
var Cr = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function I(e) {
	if (!Cr.test(e)) throw Error("@supabase/auth-js: Expected parameter to be UUID but is not");
}
function L(e) {
	if (!e.passkey) throw Error("@supabase/auth-js: the passkey API is experimental and disabled by default. Enable it by passing `auth: { experimental: { passkey: true } }` to createClient (or to the GoTrueClient constructor).");
}
function wr() {
	return new Proxy({}, {
		get: (e, t) => {
			if (t === "__isUserNotAvailableProxy") return !0;
			if (typeof t == "symbol") {
				let e = t.toString();
				if (e === "Symbol(Symbol.toPrimitive)" || e === "Symbol(Symbol.toStringTag)" || e === "Symbol(util.inspect.custom)") return;
			}
			throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${t}" property of the session object is not supported. Please use getUser() instead.`);
		},
		set: (e, t) => {
			throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
		},
		deleteProperty: (e, t) => {
			throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
		}
	});
}
function Tr(e, t) {
	return new Proxy(e, { get: (e, n, r) => {
		if (n === "__isInsecureUserWarningProxy") return !0;
		if (typeof n == "symbol") {
			let t = n.toString();
			if (t === "Symbol(Symbol.toPrimitive)" || t === "Symbol(Symbol.toStringTag)" || t === "Symbol(util.inspect.custom)" || t === "Symbol(nodejs.util.inspect.custom)") return Reflect.get(e, n, r);
		}
		return !t.value && typeof n == "string" && (console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."), t.value = !0), Reflect.get(e, n, r);
	} });
}
function Er(e) {
	return JSON.parse(JSON.stringify(e));
}
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/fetch.js
var R = (e) => {
	if (typeof e == "object" && e) {
		let t = e;
		if (typeof t.msg == "string") return t.msg;
		if (typeof t.message == "string") return t.message;
		if (typeof t.error_description == "string") return t.error_description;
		if (typeof t.error == "string") return t.error;
	}
	return JSON.stringify(e);
}, Dr = [
	500,
	501,
	502,
	503,
	504,
	520,
	521,
	522,
	523,
	524,
	525,
	526,
	527,
	528,
	529,
	530
];
async function Or(e) {
	if (!lr(e)) throw new zn(R(e), 0);
	if (Dr.includes(e.status)) throw new zn(R(e), e.status);
	let t;
	try {
		t = await e.json();
	} catch (e) {
		throw new k(R(e), e);
	}
	let n, r = br(e);
	if (r && r.getTime() >= Dn["2024-01-01"].timestamp && typeof t == "object" && t && typeof t.code == "string" ? n = t.code : typeof t == "object" && t && typeof t.error_code == "string" && (n = t.error_code), !n) {
		if (typeof t == "object" && t && typeof t.weak_password == "object" && t.weak_password && Array.isArray(t.weak_password.reasons) && t.weak_password.reasons.length && t.weak_password.reasons.reduce((e, t) => e && typeof t == "string", !0)) throw new Un(R(t), e.status, t.weak_password.reasons);
	} else if (n === "weak_password") throw new Un(R(t), e.status, t.weak_password?.reasons || []);
	else if (n === "session_not_found") throw new j();
	throw new An(R(t), e.status || 500, n);
}
var kr = (e, t, n, r) => {
	let i = {
		method: e,
		headers: t?.headers || {}
	};
	return e === "GET" ? i : (i.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, t?.headers), i.body = JSON.stringify(r), Object.assign(Object.assign({}, i), n));
};
async function z(e, t, n, r) {
	let i = Object.assign({}, r?.headers);
	i["X-Supabase-Api-Version"] || (i[En] = Dn["2024-01-01"].name), r?.jwt && (i.Authorization = `Bearer ${r.jwt}`);
	let a = r?.query ?? {};
	r?.redirectTo && (a.redirect_to = r.redirectTo);
	let o = await Ar(e, t, n + (Object.keys(a).length ? "?" + new URLSearchParams(a).toString() : ""), {
		headers: i,
		noResolveJson: r?.noResolveJson
	}, {}, r?.body);
	return r?.xform ? r?.xform(o) : {
		data: Object.assign({}, o),
		error: null
	};
}
async function Ar(e, t, n, r, i, a) {
	let o = kr(t, r, i, a), s;
	try {
		s = await e(n, Object.assign({}, o));
	} catch (e) {
		throw console.error(e), new zn(R(e), 0);
	}
	if (s.ok || await Or(s), r?.noResolveJson) return s;
	try {
		return await s.json();
	} catch (e) {
		await Or(e);
	}
}
function B(e) {
	let t = null;
	Fr(e) && (t = Object.assign({}, e), e.expires_at || (t.expires_at = rr(e.expires_in)));
	let n = e.user ?? (typeof e?.id == "string" ? e : null);
	return {
		data: {
			session: t,
			user: n
		},
		error: null
	};
}
function jr(e) {
	let t = B(e);
	return !t.error && e.weak_password && typeof e.weak_password == "object" && Array.isArray(e.weak_password.reasons) && e.weak_password.reasons.length && e.weak_password.message && typeof e.weak_password.message == "string" && e.weak_password.reasons.reduce((e, t) => e && typeof t == "string", !0) && (t.data.weak_password = e.weak_password), t;
}
function V(e) {
	return {
		data: { user: e.user ?? e },
		error: null
	};
}
function Mr(e) {
	return {
		data: e,
		error: null
	};
}
function Nr(t) {
	let { action_link: n, email_otp: r, hashed_token: i, redirect_to: a, verification_type: o } = t, s = e(t, [
		"action_link",
		"email_otp",
		"hashed_token",
		"redirect_to",
		"verification_type"
	]);
	return {
		data: {
			properties: {
				action_link: n,
				email_otp: r,
				hashed_token: i,
				redirect_to: a,
				verification_type: o
			},
			user: Object.assign({}, s)
		},
		error: null
	};
}
function Pr(e) {
	return e;
}
function Fr(e) {
	return !!e.access_token && !!e.refresh_token && !!e.expires_in;
}
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/types.js
var Ir = [
	"global",
	"local",
	"others"
], Lr = class {
	constructor({ url: e = "", headers: t = {}, fetch: n, experimental: r }) {
		this.url = e, this.headers = t, this.fetch = cr(n), this.experimental = r ?? {}, this.mfa = {
			listFactors: this._listFactors.bind(this),
			deleteFactor: this._deleteFactor.bind(this)
		}, this.oauth = {
			listClients: this._listOAuthClients.bind(this),
			createClient: this._createOAuthClient.bind(this),
			getClient: this._getOAuthClient.bind(this),
			updateClient: this._updateOAuthClient.bind(this),
			deleteClient: this._deleteOAuthClient.bind(this),
			regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this)
		}, this.customProviders = {
			listProviders: this._listCustomProviders.bind(this),
			createProvider: this._createCustomProvider.bind(this),
			getProvider: this._getCustomProvider.bind(this),
			updateProvider: this._updateCustomProvider.bind(this),
			deleteProvider: this._deleteCustomProvider.bind(this)
		}, this.passkey = {
			listPasskeys: this._adminListPasskeys.bind(this),
			deletePasskey: this._adminDeletePasskey.bind(this)
		};
	}
	async signOut(e, t = Ir[0]) {
		if (Ir.indexOf(t) < 0) throw Error(`@supabase/auth-js: Parameter scope must be one of ${Ir.join(", ")}`);
		try {
			return await z(this.fetch, "POST", `${this.url}/logout?scope=${t}`, {
				headers: this.headers,
				jwt: e,
				noResolveJson: !0
			}), {
				data: null,
				error: null
			};
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async inviteUserByEmail(e, t = {}) {
		try {
			return await z(this.fetch, "POST", `${this.url}/invite`, {
				body: {
					email: e,
					data: t.data
				},
				headers: this.headers,
				redirectTo: t.redirectTo,
				xform: V
			});
		} catch (e) {
			if (O(e)) return {
				data: { user: null },
				error: e
			};
			throw e;
		}
	}
	async generateLink(t) {
		try {
			let { options: n } = t, r = e(t, ["options"]), i = Object.assign(Object.assign({}, r), n);
			return "newEmail" in r && (i.new_email = r?.newEmail, delete i.newEmail), await z(this.fetch, "POST", `${this.url}/admin/generate_link`, {
				body: i,
				headers: this.headers,
				xform: Nr,
				redirectTo: n?.redirectTo
			});
		} catch (e) {
			if (O(e)) return {
				data: {
					properties: null,
					user: null
				},
				error: e
			};
			throw e;
		}
	}
	async createUser(e) {
		try {
			return await z(this.fetch, "POST", `${this.url}/admin/users`, {
				body: e,
				headers: this.headers,
				xform: V
			});
		} catch (e) {
			if (O(e)) return {
				data: { user: null },
				error: e
			};
			throw e;
		}
	}
	async listUsers(e) {
		try {
			let t = {
				nextPage: null,
				lastPage: 0,
				total: 0
			}, n = await z(this.fetch, "GET", `${this.url}/admin/users`, {
				headers: this.headers,
				noResolveJson: !0,
				query: {
					page: (e?.page)?.toString() ?? "",
					per_page: (e?.perPage)?.toString() ?? ""
				},
				xform: Pr
			});
			if (n.error) throw n.error;
			let r = await n.json(), i = n.headers.get("x-total-count") ?? 0, a = n.headers.get("link")?.split(",") ?? [];
			return a.length > 0 && (a.forEach((e) => {
				let n = parseInt(e.split(";")[0].split("=")[1].substring(0, 1)), r = JSON.parse(e.split(";")[1].split("=")[1]);
				t[`${r}Page`] = n;
			}), t.total = parseInt(i)), {
				data: Object.assign(Object.assign({}, r), t),
				error: null
			};
		} catch (e) {
			if (O(e)) return {
				data: { users: [] },
				error: e
			};
			throw e;
		}
	}
	async getUserById(e) {
		I(e);
		try {
			return await z(this.fetch, "GET", `${this.url}/admin/users/${e}`, {
				headers: this.headers,
				xform: V
			});
		} catch (e) {
			if (O(e)) return {
				data: { user: null },
				error: e
			};
			throw e;
		}
	}
	async updateUserById(e, t) {
		I(e);
		try {
			return await z(this.fetch, "PUT", `${this.url}/admin/users/${e}`, {
				body: t,
				headers: this.headers,
				xform: V
			});
		} catch (e) {
			if (O(e)) return {
				data: { user: null },
				error: e
			};
			throw e;
		}
	}
	async deleteUser(e, t = !1) {
		I(e);
		try {
			return await z(this.fetch, "DELETE", `${this.url}/admin/users/${e}`, {
				headers: this.headers,
				body: { should_soft_delete: t },
				xform: V
			});
		} catch (e) {
			if (O(e)) return {
				data: { user: null },
				error: e
			};
			throw e;
		}
	}
	async _listFactors(e) {
		I(e.userId);
		try {
			let { data: t, error: n } = await z(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/factors`, {
				headers: this.headers,
				xform: (e) => ({
					data: { factors: e },
					error: null
				})
			});
			return {
				data: t,
				error: n
			};
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _deleteFactor(e) {
		I(e.userId), I(e.id);
		try {
			return {
				data: await z(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/factors/${e.id}`, { headers: this.headers }),
				error: null
			};
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _listOAuthClients(e) {
		try {
			let t = {
				nextPage: null,
				lastPage: 0,
				total: 0
			}, n = await z(this.fetch, "GET", `${this.url}/admin/oauth/clients`, {
				headers: this.headers,
				noResolveJson: !0,
				query: {
					page: (e?.page)?.toString() ?? "",
					per_page: (e?.perPage)?.toString() ?? ""
				},
				xform: Pr
			});
			if (n.error) throw n.error;
			let r = await n.json(), i = n.headers.get("x-total-count") ?? 0, a = n.headers.get("link")?.split(",") ?? [];
			return a.length > 0 && (a.forEach((e) => {
				let n = parseInt(e.split(";")[0].split("=")[1].substring(0, 1)), r = JSON.parse(e.split(";")[1].split("=")[1]);
				t[`${r}Page`] = n;
			}), t.total = parseInt(i)), {
				data: Object.assign(Object.assign({}, r), t),
				error: null
			};
		} catch (e) {
			if (O(e)) return {
				data: { clients: [] },
				error: e
			};
			throw e;
		}
	}
	async _createOAuthClient(e) {
		try {
			return await z(this.fetch, "POST", `${this.url}/admin/oauth/clients`, {
				body: e,
				headers: this.headers,
				xform: (e) => ({
					data: e,
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _getOAuthClient(e) {
		try {
			return await z(this.fetch, "GET", `${this.url}/admin/oauth/clients/${e}`, {
				headers: this.headers,
				xform: (e) => ({
					data: e,
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _updateOAuthClient(e, t) {
		try {
			return await z(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${e}`, {
				body: t,
				headers: this.headers,
				xform: (e) => ({
					data: e,
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _deleteOAuthClient(e) {
		try {
			return await z(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${e}`, {
				headers: this.headers,
				noResolveJson: !0
			}), {
				data: null,
				error: null
			};
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _regenerateOAuthClientSecret(e) {
		try {
			return await z(this.fetch, "POST", `${this.url}/admin/oauth/clients/${e}/regenerate_secret`, {
				headers: this.headers,
				xform: (e) => ({
					data: e,
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _listCustomProviders(e) {
		try {
			let t = {};
			return e?.type && (t.type = e.type), await z(this.fetch, "GET", `${this.url}/admin/custom-providers`, {
				headers: this.headers,
				query: t,
				xform: (e) => ({
					data: { providers: e?.providers ?? [] },
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: { providers: [] },
				error: e
			};
			throw e;
		}
	}
	async _createCustomProvider(e) {
		try {
			return await z(this.fetch, "POST", `${this.url}/admin/custom-providers`, {
				body: e,
				headers: this.headers,
				xform: (e) => ({
					data: e,
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _getCustomProvider(e) {
		try {
			return await z(this.fetch, "GET", `${this.url}/admin/custom-providers/${e}`, {
				headers: this.headers,
				xform: (e) => ({
					data: e,
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _updateCustomProvider(e, t) {
		try {
			return await z(this.fetch, "PUT", `${this.url}/admin/custom-providers/${e}`, {
				body: t,
				headers: this.headers,
				xform: (e) => ({
					data: e,
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _deleteCustomProvider(e) {
		try {
			return await z(this.fetch, "DELETE", `${this.url}/admin/custom-providers/${e}`, {
				headers: this.headers,
				noResolveJson: !0
			}), {
				data: null,
				error: null
			};
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _adminListPasskeys(e) {
		L(this.experimental), I(e.userId);
		try {
			return await z(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/passkeys`, {
				headers: this.headers,
				xform: (e) => ({
					data: e,
					error: null
				})
			});
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
	async _adminDeletePasskey(e) {
		L(this.experimental), I(e.userId), I(e.passkeyId);
		try {
			return await z(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/passkeys/${e.passkeyId}`, {
				headers: this.headers,
				noResolveJson: !0
			}), {
				data: null,
				error: null
			};
		} catch (e) {
			if (O(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
};
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/local-storage.js
function Rr(e = {}) {
	return {
		getItem: (t) => e[t] || null,
		setItem: (t, n) => {
			e[t] = n;
		},
		removeItem: (t) => {
			delete e[t];
		}
	};
}
globalThis && or() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug");
var zr = class extends Error {
	constructor(e) {
		super(e), this.isAcquireTimeout = !0;
	}
};
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/polyfills.js
function Br() {
	if (typeof globalThis != "object") try {
		Object.defineProperty(Object.prototype, "__magic__", {
			get: function() {
				return this;
			},
			configurable: !0
		}), __magic__.globalThis = __magic__, delete Object.prototype.__magic__;
	} catch {
		typeof self < "u" && (self.globalThis = self);
	}
}
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/web3/ethereum.js
function Vr(e) {
	if (!/^0x[a-fA-F0-9]{40}$/.test(e)) throw Error(`@supabase/auth-js: Address "${e}" is invalid.`);
	return e.toLowerCase();
}
function Hr(e) {
	return parseInt(e, 16);
}
function Ur(e) {
	let t = new TextEncoder().encode(e);
	return "0x" + Array.from(t, (e) => e.toString(16).padStart(2, "0")).join("");
}
function Wr(e) {
	let { chainId: t, domain: n, expirationTime: r, issuedAt: i = /* @__PURE__ */ new Date(), nonce: a, notBefore: o, requestId: s, resources: c, scheme: l, uri: u, version: d } = e;
	if (!Number.isInteger(t)) throw Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${t}`);
	if (!n) throw Error("@supabase/auth-js: Invalid SIWE message field \"domain\". Domain must be provided.");
	if (a && a.length < 8) throw Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${a}`);
	if (!u) throw Error("@supabase/auth-js: Invalid SIWE message field \"uri\". URI must be provided.");
	if (d !== "1") throw Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${d}`);
	if (e.statement?.includes("\n")) throw Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${e.statement}`);
	let f = Vr(e.address), p = `${l ? `${l}://${n}` : n} wants you to sign in with your Ethereum account:\n${f}\n\n${e.statement ? `${e.statement}\n` : ""}`, m = `URI: ${u}\nVersion: ${d}\nChain ID: ${t}${a ? `\nNonce: ${a}` : ""}\nIssued At: ${i.toISOString()}`;
	if (r && (m += `\nExpiration Time: ${r.toISOString()}`), o && (m += `\nNot Before: ${o.toISOString()}`), s && (m += `\nRequest ID: ${s}`), c) {
		let e = "\nResources:";
		for (let t of c) {
			if (!t || typeof t != "string") throw Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${t}`);
			e += `\n- ${t}`;
		}
		m += e;
	}
	return `${p}\n${m}`;
}
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/webauthn.errors.js
var H = class extends Error {
	constructor({ message: e, code: t, cause: n, name: r }) {
		super(e, { cause: n }), this.__isWebAuthnError = !0, this.name = r ?? (n instanceof Error ? n.name : void 0) ?? "Unknown Error", this.code = t;
	}
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			code: this.code
		};
	}
}, Gr = class extends H {
	constructor(e, t) {
		super({
			code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
			cause: t,
			message: e
		}), this.name = "WebAuthnUnknownError", this.originalError = t;
	}
};
function Kr({ error: e, options: t }) {
	let { publicKey: n } = t;
	if (!n) throw Error("options was missing required publicKey property");
	if (e.name === "AbortError") {
		if (t.signal instanceof AbortSignal) return new H({
			message: "Registration ceremony was sent an abort signal",
			code: "ERROR_CEREMONY_ABORTED",
			cause: e
		});
	} else if (e.name === "ConstraintError") {
		if (n.authenticatorSelection?.requireResidentKey === !0) return new H({
			message: "Discoverable credentials were required but no available authenticator supported it",
			code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
			cause: e
		});
		if (t.mediation === "conditional" && n.authenticatorSelection?.userVerification === "required") return new H({
			message: "User verification was required during automatic registration but it could not be performed",
			code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
			cause: e
		});
		if (n.authenticatorSelection?.userVerification === "required") return new H({
			message: "User verification was required but no available authenticator supported it",
			code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
			cause: e
		});
	} else if (e.name === "InvalidStateError") return new H({
		message: "The authenticator was previously registered",
		code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
		cause: e
	});
	else if (e.name === "NotAllowedError") return new H({
		message: e.message,
		code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
		cause: e
	});
	else if (e.name === "NotSupportedError") return n.pubKeyCredParams.filter((e) => e.type === "public-key").length === 0 ? new H({
		message: "No entry in pubKeyCredParams was of type \"public-key\"",
		code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
		cause: e
	}) : new H({
		message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
		code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
		cause: e
	});
	else if (e.name === "SecurityError") {
		let t = window.location.hostname;
		if (!$r(t)) return new H({
			message: `${window.location.hostname} is an invalid domain`,
			code: "ERROR_INVALID_DOMAIN",
			cause: e
		});
		if (n.rp.id !== t) return new H({
			message: `The RP ID "${n.rp.id}" is invalid for this domain`,
			code: "ERROR_INVALID_RP_ID",
			cause: e
		});
	} else if (e.name === "TypeError") {
		if (n.user.id.byteLength < 1 || n.user.id.byteLength > 64) return new H({
			message: "User ID was not between 1 and 64 characters",
			code: "ERROR_INVALID_USER_ID_LENGTH",
			cause: e
		});
	} else if (e.name === "UnknownError") return new H({
		message: "The authenticator was unable to process the specified options, or could not create a new credential",
		code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
		cause: e
	});
	return new H({
		message: "a Non-Webauthn related error has occurred",
		code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
		cause: e
	});
}
function qr({ error: e, options: t }) {
	let { publicKey: n } = t;
	if (!n) throw Error("options was missing required publicKey property");
	if (e.name === "AbortError") {
		if (t.signal instanceof AbortSignal) return new H({
			message: "Authentication ceremony was sent an abort signal",
			code: "ERROR_CEREMONY_ABORTED",
			cause: e
		});
	} else if (e.name === "NotAllowedError") return new H({
		message: e.message,
		code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
		cause: e
	});
	else if (e.name === "SecurityError") {
		let t = window.location.hostname;
		if (!$r(t)) return new H({
			message: `${window.location.hostname} is an invalid domain`,
			code: "ERROR_INVALID_DOMAIN",
			cause: e
		});
		if (n.rpId !== t) return new H({
			message: `The RP ID "${n.rpId}" is invalid for this domain`,
			code: "ERROR_INVALID_RP_ID",
			cause: e
		});
	} else if (e.name === "UnknownError") return new H({
		message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
		code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
		cause: e
	});
	return new H({
		message: "a Non-Webauthn related error has occurred",
		code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
		cause: e
	});
}
var Jr = new class {
	createNewAbortSignal() {
		if (this.controller) {
			let e = /* @__PURE__ */ Error("Cancelling existing WebAuthn API call for new one");
			e.name = "AbortError", this.controller.abort(e);
		}
		let e = new AbortController();
		return this.controller = e, e.signal;
	}
	cancelCeremony() {
		if (this.controller) {
			let e = /* @__PURE__ */ Error("Manually cancelling existing WebAuthn API call");
			e.name = "AbortError", this.controller.abort(e), this.controller = void 0;
		}
	}
}();
function Yr(t) {
	if (!t) throw Error("Credential creation options are required");
	if (typeof PublicKeyCredential < "u" && "parseCreationOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON == "function") return PublicKeyCredential.parseCreationOptionsFromJSON(t);
	let { challenge: n, user: r, excludeCredentials: i } = t, a = e(t, [
		"challenge",
		"user",
		"excludeCredentials"
	]), o = er(n).buffer, s = Object.assign(Object.assign({}, r), { id: er(r.id).buffer }), c = Object.assign(Object.assign({}, a), {
		challenge: o,
		user: s
	});
	if (i && i.length > 0) {
		c.excludeCredentials = Array(i.length);
		for (let e = 0; e < i.length; e++) {
			let t = i[e];
			c.excludeCredentials[e] = Object.assign(Object.assign({}, t), {
				id: er(t.id).buffer,
				type: t.type || "public-key",
				transports: t.transports
			});
		}
	}
	return c;
}
function Xr(t) {
	if (!t) throw Error("Credential request options are required");
	if (typeof PublicKeyCredential < "u" && "parseRequestOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON == "function") return PublicKeyCredential.parseRequestOptionsFromJSON(t);
	let { challenge: n, allowCredentials: r } = t, i = e(t, ["challenge", "allowCredentials"]), a = er(n).buffer, o = Object.assign(Object.assign({}, i), { challenge: a });
	if (r && r.length > 0) {
		o.allowCredentials = Array(r.length);
		for (let e = 0; e < r.length; e++) {
			let t = r[e];
			o.allowCredentials[e] = Object.assign(Object.assign({}, t), {
				id: er(t.id).buffer,
				type: t.type || "public-key",
				transports: t.transports
			});
		}
	}
	return o;
}
function Zr(e) {
	if ("toJSON" in e && typeof e.toJSON == "function") return e.toJSON();
	let t = e;
	return {
		id: e.id,
		rawId: e.id,
		response: {
			attestationObject: nr(new Uint8Array(e.response.attestationObject)),
			clientDataJSON: nr(new Uint8Array(e.response.clientDataJSON))
		},
		type: "public-key",
		clientExtensionResults: e.getClientExtensionResults(),
		authenticatorAttachment: t.authenticatorAttachment ?? void 0
	};
}
function Qr(e) {
	if ("toJSON" in e && typeof e.toJSON == "function") return e.toJSON();
	let t = e, n = e.getClientExtensionResults(), r = e.response;
	return {
		id: e.id,
		rawId: e.id,
		response: {
			authenticatorData: nr(new Uint8Array(r.authenticatorData)),
			clientDataJSON: nr(new Uint8Array(r.clientDataJSON)),
			signature: nr(new Uint8Array(r.signature)),
			userHandle: r.userHandle ? nr(new Uint8Array(r.userHandle)) : void 0
		},
		type: "public-key",
		clientExtensionResults: n,
		authenticatorAttachment: t.authenticatorAttachment ?? void 0
	};
}
function $r(e) {
	return e === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(e);
}
function ei() {
	return !!(M() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && typeof (navigator == null ? void 0 : navigator.credentials)?.create == "function" && typeof (navigator == null ? void 0 : navigator.credentials)?.get == "function");
}
async function ti(e) {
	try {
		let t = await navigator.credentials.create(e);
		return t ? t instanceof PublicKeyCredential ? {
			data: t,
			error: null
		} : {
			data: null,
			error: new Gr("Browser returned unexpected credential type", t)
		} : {
			data: null,
			error: new Gr("Empty credential response", t)
		};
	} catch (t) {
		return {
			data: null,
			error: Kr({
				error: t,
				options: e
			})
		};
	}
}
async function ni(e) {
	try {
		let t = await navigator.credentials.get(e);
		return t ? t instanceof PublicKeyCredential ? {
			data: t,
			error: null
		} : {
			data: null,
			error: new Gr("Browser returned unexpected credential type", t)
		} : {
			data: null,
			error: new Gr("Empty credential response", t)
		};
	} catch (t) {
		return {
			data: null,
			error: qr({
				error: t,
				options: e
			})
		};
	}
}
var ri = {
	hints: ["security-key"],
	authenticatorSelection: {
		authenticatorAttachment: "cross-platform",
		requireResidentKey: !1,
		userVerification: "preferred",
		residentKey: "discouraged"
	},
	attestation: "direct"
}, ii = {
	userVerification: "preferred",
	hints: ["security-key"],
	attestation: "direct"
};
function ai(...e) {
	let t = (e) => typeof e == "object" && !!e && !Array.isArray(e), n = (e) => e instanceof ArrayBuffer || ArrayBuffer.isView(e), r = {};
	for (let i of e) if (i) for (let e in i) {
		let a = i[e];
		if (a !== void 0) if (Array.isArray(a)) r[e] = a;
		else if (n(a)) r[e] = a;
		else if (t(a)) {
			let n = r[e];
			t(n) ? r[e] = ai(n, a) : r[e] = ai(a);
		} else r[e] = a;
	}
	return r;
}
function oi(e, t) {
	return ai(ri, e, t || {});
}
function si(e, t) {
	return ai(ii, e, t || {});
}
var ci = class {
	constructor(e) {
		this.client = e, this.enroll = this._enroll.bind(this), this.challenge = this._challenge.bind(this), this.verify = this._verify.bind(this), this.authenticate = this._authenticate.bind(this), this.register = this._register.bind(this);
	}
	async _enroll(e) {
		return this.client.mfa.enroll(Object.assign(Object.assign({}, e), { factorType: "webauthn" }));
	}
	async _challenge({ factorId: e, webauthn: t, friendlyName: n, signal: r }, i) {
		try {
			let { data: a, error: o } = await this.client.mfa.challenge({
				factorId: e,
				webauthn: t
			});
			if (!a) return {
				data: null,
				error: o
			};
			let s = r ?? Jr.createNewAbortSignal();
			if (a.webauthn.type === "create") {
				let { user: e } = a.webauthn.credential_options.publicKey;
				if (!e.name) {
					let t = n;
					if (t) e.name = `${e.id}:${t}`;
					else {
						let t = (await this.client.getUser()).data.user, n = t?.user_metadata?.name || t?.email || t?.id || "User";
						e.name = `${e.id}:${n}`;
					}
				}
				e.displayName ||= e.name;
			}
			switch (a.webauthn.type) {
				case "create": {
					let { data: t, error: n } = await ti({
						publicKey: oi(a.webauthn.credential_options.publicKey, i?.create),
						signal: s
					});
					return t ? {
						data: {
							factorId: e,
							challengeId: a.id,
							webauthn: {
								type: a.webauthn.type,
								credential_response: t
							}
						},
						error: null
					} : {
						data: null,
						error: n
					};
				}
				case "request": {
					let t = si(a.webauthn.credential_options.publicKey, i?.request), { data: n, error: r } = await ni(Object.assign(Object.assign({}, a.webauthn.credential_options), {
						publicKey: t,
						signal: s
					}));
					return n ? {
						data: {
							factorId: e,
							challengeId: a.id,
							webauthn: {
								type: a.webauthn.type,
								credential_response: n
							}
						},
						error: null
					} : {
						data: null,
						error: r
					};
				}
			}
		} catch (e) {
			return O(e) ? {
				data: null,
				error: e
			} : {
				data: null,
				error: new k("Unexpected error in challenge", e)
			};
		}
	}
	async _verify({ challengeId: e, factorId: t, webauthn: n }) {
		return this.client.mfa.verify({
			factorId: t,
			challengeId: e,
			webauthn: n
		});
	}
	async _authenticate({ factorId: e, webauthn: { rpId: t = typeof window < "u" ? window.location.hostname : void 0, rpOrigins: n = typeof window < "u" ? [window.location.origin] : void 0, signal: r } = {} }, i) {
		if (!t) return {
			data: null,
			error: new kn("rpId is required for WebAuthn authentication")
		};
		try {
			if (!ei()) return {
				data: null,
				error: new k("Browser does not support WebAuthn", null)
			};
			let { data: a, error: o } = await this.challenge({
				factorId: e,
				webauthn: {
					rpId: t,
					rpOrigins: n
				},
				signal: r
			}, { request: i });
			if (!a) return {
				data: null,
				error: o
			};
			let { webauthn: s } = a;
			return this._verify({
				factorId: e,
				challengeId: a.challengeId,
				webauthn: {
					type: s.type,
					rpId: t,
					rpOrigins: n,
					credential_response: s.credential_response
				}
			});
		} catch (e) {
			return O(e) ? {
				data: null,
				error: e
			} : {
				data: null,
				error: new k("Unexpected error in authenticate", e)
			};
		}
	}
	async _register({ friendlyName: e, webauthn: { rpId: t = typeof window < "u" ? window.location.hostname : void 0, rpOrigins: n = typeof window < "u" ? [window.location.origin] : void 0, signal: r } = {} }, i) {
		if (!t) return {
			data: null,
			error: new kn("rpId is required for WebAuthn registration")
		};
		try {
			if (!ei()) return {
				data: null,
				error: new k("Browser does not support WebAuthn", null)
			};
			let { data: a, error: o } = await this._enroll({ friendlyName: e });
			if (!a) return await this.client.mfa.listFactors().then((t) => t.data?.all.find((t) => t.factor_type === "webauthn" && t.friendly_name === e && t.status !== "unverified")).then((e) => e ? this.client.mfa.unenroll({ factorId: e?.id }) : void 0), {
				data: null,
				error: o
			};
			let { data: s, error: c } = await this._challenge({
				factorId: a.id,
				friendlyName: a.friendly_name,
				webauthn: {
					rpId: t,
					rpOrigins: n
				},
				signal: r
			}, { create: i });
			return s ? this._verify({
				factorId: a.id,
				challengeId: s.challengeId,
				webauthn: {
					rpId: t,
					rpOrigins: n,
					type: s.webauthn.type,
					credential_response: s.webauthn.credential_response
				}
			}) : {
				data: null,
				error: c
			};
		} catch (e) {
			return O(e) ? {
				data: null,
				error: e
			} : {
				data: null,
				error: new k("Unexpected error in register", e)
			};
		}
	}
};
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/GoTrueClient.js
Br();
var li = {
	url: Cn,
	storageKey: wn,
	autoRefreshToken: !0,
	persistSession: !0,
	detectSessionInUrl: !0,
	headers: Tn,
	flowType: "implicit",
	debug: !1,
	hasCustomAuthorizationHeader: !1,
	throwOnError: !1,
	lockAcquireTimeout: 5e3,
	skipAutoInitialize: !1,
	experimental: {}
}, ui = {}, di = class e {
	get jwks() {
		return ui[this.storageKey]?.jwks ?? { keys: [] };
	}
	set jwks(e) {
		ui[this.storageKey] = Object.assign(Object.assign({}, ui[this.storageKey]), { jwks: e });
	}
	get jwks_cached_at() {
		return ui[this.storageKey]?.cachedAt ?? -(2 ** 53 - 1);
	}
	set jwks_cached_at(e) {
		ui[this.storageKey] = Object.assign(Object.assign({}, ui[this.storageKey]), { cachedAt: e });
	}
	constructor(t) {
		var n;
		this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.autoRefreshTickTimeout = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.lastRefreshFailure = null, this._sessionRemovalEpoch = 0, this.initializePromise = null, this._pendingInitNotifications = null, this.detectSessionInUrl = !0, this.hasCustomAuthorizationHeader = !1, this.suppressGetSessionWarning = !1, this.lock = null, this.lockAcquired = !1, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log;
		let r = Object.assign(Object.assign({}, li), t);
		if (this.storageKey = r.storageKey, this.instanceID = e.nextInstanceID[this.storageKey] ?? 0, e.nextInstanceID[this.storageKey] = this.instanceID + 1, this.logDebugMessages = !!r.debug, typeof r.debug == "function" && (this.logger = r.debug), this.instanceID > 0 && M()) {
			let e = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
			console.warn(e), this.logDebugMessages && console.trace(e);
		}
		if (this.persistSession = r.persistSession, this.autoRefreshToken = r.autoRefreshToken, this.experimental = r.experimental ?? {}, this.admin = new Lr({
			url: r.url,
			headers: r.headers,
			fetch: r.fetch,
			experimental: this.experimental
		}), this.url = r.url, this.headers = r.headers, this.fetch = cr(r.fetch), this.detectSessionInUrl = r.detectSessionInUrl, this.flowType = r.flowType, this.hasCustomAuthorizationHeader = r.hasCustomAuthorizationHeader, this.throwOnError = r.throwOnError, this.lockAcquireTimeout = r.lockAcquireTimeout, r.lock != null && (this.lock = r.lock), this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = -(2 ** 53 - 1)), this.mfa = {
			verify: this._verify.bind(this),
			enroll: this._enroll.bind(this),
			unenroll: this._unenroll.bind(this),
			challenge: this._challenge.bind(this),
			listFactors: this._listFactors.bind(this),
			challengeAndVerify: this._challengeAndVerify.bind(this),
			getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
			webauthn: new ci(this)
		}, this.oauth = {
			getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
			approveAuthorization: this._approveAuthorization.bind(this),
			denyAuthorization: this._denyAuthorization.bind(this),
			listGrants: this._listOAuthGrants.bind(this),
			revokeGrant: this._revokeOAuthGrant.bind(this)
		}, this.passkey = {
			startRegistration: this._startPasskeyRegistration.bind(this),
			verifyRegistration: this._verifyPasskeyRegistration.bind(this),
			startAuthentication: this._startPasskeyAuthentication.bind(this),
			verifyAuthentication: this._verifyPasskeyAuthentication.bind(this),
			list: this._listPasskeys.bind(this),
			update: this._updatePasskey.bind(this),
			delete: this._deletePasskey.bind(this)
		}, this.persistSession ? (r.storage ? this.storage = r.storage : or() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = Rr(this.memoryStorage)), r.userStorage && (this.userStorage = r.userStorage)) : (this.memoryStorage = {}, this.storage = Rr(this.memoryStorage)), M() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
			try {
				this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
			} catch (e) {
				console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", e);
			}
			(n = this.broadcastChannel) == null || n.addEventListener("message", async (e) => {
				this._debug("received broadcast notification from other tab or client", e), (e.data.event === "TOKEN_REFRESHED" || e.data.event === "SIGNED_IN") && (this.lastRefreshFailure = null);
				try {
					await this._notifyAllSubscribers(e.data.event, e.data.session, !1);
				} catch (e) {
					this._debug("#broadcastChannel", "error", e);
				}
			});
		}
		r.skipAutoInitialize || this.initialize().catch((e) => {
			this._debug("#initialize()", "error", e);
		});
	}
	isThrowOnErrorEnabled() {
		return this.throwOnError;
	}
	_returnResult(e) {
		if (this.throwOnError && e && e.error) throw e.error;
		return e;
	}
	_logPrefix() {
		return `GoTrueClient@${this.storageKey}:${this.instanceID} (${yn}) ${(/* @__PURE__ */ new Date()).toISOString()}`;
	}
	_debug(...e) {
		return this.logDebugMessages && this.logger(this._logPrefix(), ...e), this;
	}
	async initialize() {
		if (this.initializePromise) return await this.initializePromise;
		this._pendingInitNotifications = [], this.initializePromise = (async () => this.lock == null ? await this._initialize() : await this._acquireLock(this.lockAcquireTimeout, async () => await this._initialize()))();
		let e = await this.initializePromise, t = this._pendingInitNotifications ?? [];
		this._pendingInitNotifications = null;
		for (let e of t) await this._notifyAllSubscribers(e.event, e.session, e.broadcast);
		return e;
	}
	async _initialize() {
		try {
			let e = {}, t = "none";
			if (M() && (e = sr(window.location.href), this._isImplicitGrantCallback(e) ? t = "implicit" : await this._isPKCECallback(e) && (t = "pkce")), M() && this.detectSessionInUrl && t !== "none") {
				let { data: n, error: r } = await this._getSessionFromURL(e, t);
				if (r) {
					if (this._debug("#_initialize()", "error detecting session from URL", r), In(r)) {
						let e = r.details?.code;
						if (e === "identity_already_exists" || e === "identity_not_found" || e === "single_identity_not_deletable") return { error: r };
					}
					return { error: r };
				}
				let { session: i, redirectType: a } = n;
				return this._debug("#_initialize()", "detected session in URL", i, "redirect type", a), await this._saveSession(i), setTimeout(async () => {
					a === "recovery" ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", i) : await this._notifyAllSubscribers("SIGNED_IN", i);
				}, 0), { error: null };
			}
			return await this._recoverAndRefresh(), { error: null };
		} catch (e) {
			return O(e) ? this._returnResult({ error: e }) : this._returnResult({ error: new k("Unexpected error during initialization", e) });
		} finally {
			await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
		}
	}
	async signInAnonymously(e) {
		try {
			let { data: t, error: n } = await z(this.fetch, "POST", `${this.url}/signup`, {
				headers: this.headers,
				body: {
					data: e?.options?.data ?? {},
					gotrue_meta_security: { captcha_token: e?.options?.captchaToken }
				},
				xform: B
			});
			if (n || !t) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: n
			});
			let r = t.session, i = t.user;
			return t.session && (await this._saveSession(t.session), await this._notifyAllSubscribers("SIGNED_IN", r)), this._returnResult({
				data: {
					user: i,
					session: r
				},
				error: null
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async signUp(e) {
		try {
			let t;
			if ("email" in e) {
				let { email: n, password: r, options: i } = e, a = null, o = null;
				this.flowType === "pkce" && ([a, o] = await F(this.storage, this.storageKey)), t = await z(this.fetch, "POST", `${this.url}/signup`, {
					headers: this.headers,
					redirectTo: i?.emailRedirectTo,
					body: {
						email: n,
						password: r,
						data: i?.data ?? {},
						gotrue_meta_security: { captcha_token: i?.captchaToken },
						code_challenge: a,
						code_challenge_method: o
					},
					xform: B
				});
			} else if ("phone" in e) {
				let { phone: n, password: r, options: i } = e;
				t = await z(this.fetch, "POST", `${this.url}/signup`, {
					headers: this.headers,
					body: {
						phone: n,
						password: r,
						data: i?.data ?? {},
						channel: i?.channel ?? "sms",
						gotrue_meta_security: { captcha_token: i?.captchaToken }
					},
					xform: B
				});
			} else throw new Pn("You must provide either an email or phone number and a password");
			let { data: n, error: r } = t;
			if (r || !n) return await P(this.storage, `${this.storageKey}-code-verifier`), this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: r
			});
			let i = n.session, a = n.user;
			return n.session && (await this._saveSession(n.session), await this._notifyAllSubscribers("SIGNED_IN", i)), this._returnResult({
				data: {
					user: a,
					session: i
				},
				error: null
			});
		} catch (e) {
			if (await P(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async signInWithPassword(e) {
		try {
			let t;
			if ("email" in e) {
				let { email: n, password: r, options: i } = e;
				t = await z(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
					headers: this.headers,
					body: {
						email: n,
						password: r,
						gotrue_meta_security: { captcha_token: i?.captchaToken }
					},
					xform: jr
				});
			} else if ("phone" in e) {
				let { phone: n, password: r, options: i } = e;
				t = await z(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
					headers: this.headers,
					body: {
						phone: n,
						password: r,
						gotrue_meta_security: { captcha_token: i?.captchaToken }
					},
					xform: jr
				});
			} else throw new Pn("You must provide either an email or phone number and a password");
			let { data: n, error: r } = t;
			if (r) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: r
			});
			if (!n || !n.session || !n.user) {
				let e = new Nn();
				return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: e
				});
			}
			return n.session && (await this._saveSession(n.session), await this._notifyAllSubscribers("SIGNED_IN", n.session)), this._returnResult({
				data: Object.assign({
					user: n.user,
					session: n.session
				}, n.weak_password ? { weakPassword: n.weak_password } : null),
				error: r
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async signInWithOAuth(e) {
		return await this._handleProviderSignIn(e.provider, {
			redirectTo: e.options?.redirectTo,
			scopes: e.options?.scopes,
			queryParams: e.options?.queryParams,
			skipBrowserRedirect: e.options?.skipBrowserRedirect
		});
	}
	async exchangeCodeForSession(e) {
		return await this.initializePromise, this.lock == null ? this._exchangeCodeForSession(e) : this._acquireLock(this.lockAcquireTimeout, async () => this._exchangeCodeForSession(e));
	}
	async signInWithWeb3(e) {
		let { chain: t } = e;
		switch (t) {
			case "ethereum": return await this.signInWithEthereum(e);
			case "solana": return await this.signInWithSolana(e);
			default: throw Error(`@supabase/auth-js: Unsupported chain "${t}"`);
		}
	}
	async signInWithEthereum(e) {
		let t, n;
		if ("message" in e) t = e.message, n = e.signature;
		else {
			let { chain: r, wallet: i, statement: a, options: o } = e, s;
			if (!M()) {
				if (typeof i != "object" || !o?.url) throw Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
				s = i;
			} else if (typeof i == "object") s = i;
			else {
				let e = window;
				if ("ethereum" in e && typeof e.ethereum == "object" && "request" in e.ethereum && typeof e.ethereum.request == "function") s = e.ethereum;
				else throw Error("@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.");
			}
			let c = new URL(o?.url ?? window.location.href), l = await s.request({ method: "eth_requestAccounts" }).then((e) => e).catch(() => {
				throw Error("@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid");
			});
			if (!l || l.length === 0) throw Error("@supabase/auth-js: No accounts available. Please ensure the wallet is connected.");
			let u = Vr(l[0]), d = o?.signInWithEthereum?.chainId;
			d ||= Hr(await s.request({ method: "eth_chainId" })), t = Wr({
				domain: c.host,
				address: u,
				statement: a,
				uri: c.href,
				version: "1",
				chainId: d,
				nonce: o?.signInWithEthereum?.nonce,
				issuedAt: o?.signInWithEthereum?.issuedAt ?? /* @__PURE__ */ new Date(),
				expirationTime: o?.signInWithEthereum?.expirationTime,
				notBefore: o?.signInWithEthereum?.notBefore,
				requestId: o?.signInWithEthereum?.requestId,
				resources: o?.signInWithEthereum?.resources
			}), n = await s.request({
				method: "personal_sign",
				params: [Ur(t), u]
			});
		}
		try {
			let { data: r, error: i } = await z(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
				headers: this.headers,
				body: Object.assign({
					chain: "ethereum",
					message: t,
					signature: n
				}, e.options?.captchaToken ? { gotrue_meta_security: { captcha_token: e.options?.captchaToken } } : null),
				xform: B
			});
			if (i) throw i;
			if (!r || !r.session || !r.user) {
				let e = new Nn();
				return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: e
				});
			}
			return r.session && (await this._saveSession(r.session), await this._notifyAllSubscribers("SIGNED_IN", r.session)), this._returnResult({
				data: Object.assign({}, r),
				error: i
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async signInWithSolana(e) {
		let t, n;
		if ("message" in e) t = e.message, n = e.signature;
		else {
			let { chain: r, wallet: i, statement: a, options: o } = e, s;
			if (!M()) {
				if (typeof i != "object" || !o?.url) throw Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
				s = i;
			} else if (typeof i == "object") s = i;
			else {
				let e = window;
				if ("solana" in e && typeof e.solana == "object" && ("signIn" in e.solana && typeof e.solana.signIn == "function" || "signMessage" in e.solana && typeof e.solana.signMessage == "function")) s = e.solana;
				else throw Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");
			}
			let c = new URL(o?.url ?? window.location.href);
			if ("signIn" in s && s.signIn) {
				let e = await s.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, o?.signInWithSolana), {
					version: "1",
					domain: c.host,
					uri: c.href
				}), a ? { statement: a } : null)), r;
				if (Array.isArray(e) && e[0] && typeof e[0] == "object") r = e[0];
				else if (e && typeof e == "object" && "signedMessage" in e && "signature" in e) r = e;
				else throw Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
				if ("signedMessage" in r && "signature" in r && (typeof r.signedMessage == "string" || r.signedMessage instanceof Uint8Array) && r.signature instanceof Uint8Array) t = typeof r.signedMessage == "string" ? r.signedMessage : new TextDecoder().decode(r.signedMessage), n = r.signature;
				else throw Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
			} else {
				if (!("signMessage" in s) || typeof s.signMessage != "function" || !("publicKey" in s) || typeof s != "object" || !s.publicKey || !("toBase58" in s.publicKey) || typeof s.publicKey.toBase58 != "function") throw Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
				t = [
					`${c.host} wants you to sign in with your Solana account:`,
					s.publicKey.toBase58(),
					...a ? [
						"",
						a,
						""
					] : [""],
					"Version: 1",
					`URI: ${c.href}`,
					`Issued At: ${o?.signInWithSolana?.issuedAt ?? (/* @__PURE__ */ new Date()).toISOString()}`,
					...o?.signInWithSolana?.notBefore ? [`Not Before: ${o.signInWithSolana.notBefore}`] : [],
					...o?.signInWithSolana?.expirationTime ? [`Expiration Time: ${o.signInWithSolana.expirationTime}`] : [],
					...o?.signInWithSolana?.chainId ? [`Chain ID: ${o.signInWithSolana.chainId}`] : [],
					...o?.signInWithSolana?.nonce ? [`Nonce: ${o.signInWithSolana.nonce}`] : [],
					...o?.signInWithSolana?.requestId ? [`Request ID: ${o.signInWithSolana.requestId}`] : [],
					...o?.signInWithSolana?.resources?.length ? ["Resources", ...o.signInWithSolana.resources.map((e) => `- ${e}`)] : []
				].join("\n");
				let e = await s.signMessage(new TextEncoder().encode(t), "utf8");
				if (!e || !(e instanceof Uint8Array)) throw Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
				n = e;
			}
		}
		try {
			let { data: r, error: i } = await z(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
				headers: this.headers,
				body: Object.assign({
					chain: "solana",
					message: t,
					signature: nr(n)
				}, e.options?.captchaToken ? { gotrue_meta_security: { captcha_token: e.options?.captchaToken } } : null),
				xform: B
			});
			if (i) throw i;
			if (!r || !r.session || !r.user) {
				let e = new Nn();
				return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: e
				});
			}
			return r.session && (await this._saveSession(r.session), await this._notifyAllSubscribers("SIGNED_IN", r.session)), this._returnResult({
				data: Object.assign({}, r),
				error: i
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async _exchangeCodeForSession(e) {
		let [t, n] = (await N(this.storage, `${this.storageKey}-code-verifier`) ?? "").split("/");
		try {
			if (!t && this.flowType === "pkce") throw new Rn();
			let { data: r, error: i } = await z(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
				headers: this.headers,
				body: {
					auth_code: e,
					code_verifier: t
				},
				xform: B
			});
			if (await P(this.storage, `${this.storageKey}-code-verifier`), i) throw i;
			if (!r || !r.session || !r.user) {
				let e = new Nn();
				return this._returnResult({
					data: {
						user: null,
						session: null,
						redirectType: null
					},
					error: e
				});
			}
			return r.session && (await this._saveSession(r.session), await this._notifyAllSubscribers(n === "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", r.session)), this._returnResult({
				data: Object.assign(Object.assign({}, r), { redirectType: n ?? null }),
				error: i
			});
		} catch (e) {
			if (await P(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
				data: {
					user: null,
					session: null,
					redirectType: null
				},
				error: e
			});
			throw e;
		}
	}
	async signInWithIdToken(e) {
		try {
			let { options: t, provider: n, token: r, access_token: i, nonce: a } = e, { data: o, error: s } = await z(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
				headers: this.headers,
				body: {
					provider: n,
					id_token: r,
					access_token: i,
					nonce: a,
					gotrue_meta_security: { captcha_token: t?.captchaToken }
				},
				xform: B
			});
			if (s) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: s
			});
			if (!o || !o.session || !o.user) {
				let e = new Nn();
				return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: e
				});
			}
			return o.session && (await this._saveSession(o.session), await this._notifyAllSubscribers("SIGNED_IN", o.session)), this._returnResult({
				data: o,
				error: s
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async signInWithOtp(e) {
		try {
			if ("email" in e) {
				let { email: t, options: n } = e, r = null, i = null;
				this.flowType === "pkce" && ([r, i] = await F(this.storage, this.storageKey));
				let { error: a } = await z(this.fetch, "POST", `${this.url}/otp`, {
					headers: this.headers,
					body: {
						email: t,
						data: n?.data ?? {},
						create_user: n?.shouldCreateUser ?? !0,
						gotrue_meta_security: { captcha_token: n?.captchaToken },
						code_challenge: r,
						code_challenge_method: i
					},
					redirectTo: n?.emailRedirectTo
				});
				return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: a
				});
			}
			if ("phone" in e) {
				let { phone: t, options: n } = e, { data: r, error: i } = await z(this.fetch, "POST", `${this.url}/otp`, {
					headers: this.headers,
					body: {
						phone: t,
						data: n?.data ?? {},
						create_user: n?.shouldCreateUser ?? !0,
						gotrue_meta_security: { captcha_token: n?.captchaToken },
						channel: n?.channel ?? "sms"
					}
				});
				return this._returnResult({
					data: {
						user: null,
						session: null,
						messageId: r?.message_id
					},
					error: i
				});
			}
			throw new Pn("You must provide either an email or phone number.");
		} catch (e) {
			if (await P(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async verifyOtp(e) {
		try {
			let t, n;
			"options" in e && (t = e.options?.redirectTo, n = e.options?.captchaToken);
			let { data: r, error: i } = await z(this.fetch, "POST", `${this.url}/verify`, {
				headers: this.headers,
				body: Object.assign(Object.assign({}, e), { gotrue_meta_security: { captcha_token: n } }),
				redirectTo: t,
				xform: B
			});
			if (i) throw i;
			if (!r) throw /* @__PURE__ */ Error("An error occurred on token verification.");
			let a = r.session, o = r.user;
			return a?.access_token && (await this._saveSession(a), await this._notifyAllSubscribers(e.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", a)), this._returnResult({
				data: {
					user: o,
					session: a
				},
				error: null
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async signInWithSSO(e) {
		try {
			let t = null, n = null;
			this.flowType === "pkce" && ([t, n] = await F(this.storage, this.storageKey));
			let r = await z(this.fetch, "POST", `${this.url}/sso`, {
				body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in e ? { provider_id: e.providerId } : null), "domain" in e ? { domain: e.domain } : null), { redirect_to: e.options?.redirectTo ?? void 0 }), e?.options?.captchaToken ? { gotrue_meta_security: { captcha_token: e.options.captchaToken } } : null), {
					skip_http_redirect: !0,
					code_challenge: t,
					code_challenge_method: n
				}),
				headers: this.headers,
				xform: Mr
			});
			return r.data?.url && M() && !e.options?.skipBrowserRedirect && window.location.assign(r.data.url), this._returnResult(r);
		} catch (e) {
			if (await P(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async reauthenticate() {
		return await this.initializePromise, this.lock == null ? await this._reauthenticate() : await this._acquireLock(this.lockAcquireTimeout, async () => await this._reauthenticate());
	}
	async _reauthenticate() {
		try {
			return await this._useSession(async (e) => {
				let { data: { session: t }, error: n } = e;
				if (n) throw n;
				if (!t) throw new j();
				let { error: r } = await z(this.fetch, "GET", `${this.url}/reauthenticate`, {
					headers: this.headers,
					jwt: t.access_token
				});
				return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: r
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async resend(e) {
		try {
			let t = `${this.url}/resend`;
			if ("email" in e) {
				let { email: n, type: r, options: i } = e, a = null, o = null;
				this.flowType === "pkce" && ([a, o] = await F(this.storage, this.storageKey));
				let { error: s } = await z(this.fetch, "POST", t, {
					headers: this.headers,
					body: {
						email: n,
						type: r,
						gotrue_meta_security: { captcha_token: i?.captchaToken },
						code_challenge: a,
						code_challenge_method: o
					},
					redirectTo: i?.emailRedirectTo
				});
				return s && await P(this.storage, `${this.storageKey}-code-verifier`), this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: s
				});
			} else if ("phone" in e) {
				let { phone: n, type: r, options: i } = e, { data: a, error: o } = await z(this.fetch, "POST", t, {
					headers: this.headers,
					body: {
						phone: n,
						type: r,
						gotrue_meta_security: { captcha_token: i?.captchaToken }
					}
				});
				return this._returnResult({
					data: {
						user: null,
						session: null,
						messageId: a?.message_id
					},
					error: o
				});
			}
			throw new Pn("You must provide either an email or phone number and a type");
		} catch (e) {
			if (await P(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async getSession() {
		return await this.initializePromise, this.lock == null ? await this._useSession(async (e) => e) : await this._acquireLock(this.lockAcquireTimeout, async () => this._useSession(async (e) => e));
	}
	async _acquireLock(e, t) {
		this._debug("#_acquireLock", "begin", e);
		try {
			if (this.lockAcquired) {
				let e = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), n = (async () => (await e, await t()))();
				return this.pendingInLock.push((async () => {
					try {
						await n;
					} catch {}
				})()), n;
			}
			return await this.lock(`lock:${this.storageKey}`, e, async () => {
				this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
				try {
					this.lockAcquired = !0;
					let e = t();
					for (this.pendingInLock.push((async () => {
						try {
							await e;
						} catch {}
					})()), await e; this.pendingInLock.length;) {
						let e = [...this.pendingInLock];
						await Promise.all(e), this.pendingInLock.splice(0, e.length);
					}
					return await e;
				} finally {
					this._debug("#_acquireLock", "lock released for storage key", this.storageKey), this.lockAcquired = !1;
				}
			});
		} finally {
			this._debug("#_acquireLock", "end");
		}
	}
	async _useSession(e) {
		this._debug("#_useSession", "begin");
		try {
			return await e(await this.__loadSession());
		} finally {
			this._debug("#_useSession", "end");
		}
	}
	async __loadSession() {
		this._debug("#__loadSession()", "begin"), this.lock != null && !this.lockAcquired && this._debug("#__loadSession()", "used outside of an acquired lock!", (/* @__PURE__ */ Error()).stack);
		try {
			let e = null, t = await N(this.storage, this.storageKey);
			if (this._debug("#getSession()", "session from storage", t), t !== null && (this._isValidSession(t) ? e = t : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !e) return {
				data: { session: null },
				error: null
			};
			let n = e.expires_at ? e.expires_at * 1e3 - Date.now() < xn : !1;
			if (this._debug("#__loadSession()", `session has${n ? "" : " not"} expired`, "expires_at", e.expires_at), !n) {
				if (this.userStorage) {
					let t = await N(this.userStorage, this.storageKey + "-user");
					t?.user ? e.user = t.user : e.user = wr();
				}
				if (this.storage.isServer && e.user && !e.user.__isUserNotAvailableProxy) {
					let t = { value: this.suppressGetSessionWarning };
					e.user = Tr(e.user, t), t.value && (this.suppressGetSessionWarning = !0);
				}
				return {
					data: { session: e },
					error: null
				};
			}
			let { data: r, error: i } = await this._callRefreshToken(e.refresh_token);
			if (i) {
				if (e.expires_at && e.expires_at * 1e3 > Date.now()) {
					let t = await N(this.storage, this.storageKey);
					if (t && t.refresh_token === e.refresh_token) return this._returnResult({
						data: { session: e },
						error: null
					});
				}
				return this._returnResult({
					data: { session: null },
					error: i
				});
			}
			return this._returnResult({
				data: { session: r },
				error: null
			});
		} finally {
			this._debug("#__loadSession()", "end");
		}
	}
	async getUser(e) {
		if (e) return await this._getUser(e);
		await this.initializePromise;
		let t;
		return t = this.lock == null ? await this._getUser() : await this._acquireLock(this.lockAcquireTimeout, async () => await this._getUser()), t.data.user && (this.suppressGetSessionWarning = !0), t;
	}
	async _getUser(e) {
		try {
			return e ? await z(this.fetch, "GET", `${this.url}/user`, {
				headers: this.headers,
				jwt: e,
				xform: V
			}) : await this._useSession(async (e) => {
				let { data: t, error: n } = e;
				if (n) throw n;
				return !t.session?.access_token && !this.hasCustomAuthorizationHeader ? {
					data: { user: null },
					error: new j()
				} : await z(this.fetch, "GET", `${this.url}/user`, {
					headers: this.headers,
					jwt: t.session?.access_token ?? void 0,
					xform: V
				});
			});
		} catch (e) {
			if (O(e)) return Mn(e) && (await this._removeSession(), await P(this.storage, `${this.storageKey}-code-verifier`)), this._returnResult({
				data: { user: null },
				error: e
			});
			throw e;
		}
	}
	async updateUser(e, t = {}) {
		return await this.initializePromise, this.lock == null ? await this._updateUser(e, t) : await this._acquireLock(this.lockAcquireTimeout, async () => await this._updateUser(e, t));
	}
	async _updateUser(e, t = {}) {
		try {
			return await this._useSession(async (n) => {
				let { data: r, error: i } = n;
				if (i) throw i;
				if (!r.session) throw new j();
				let a = r.session, o = null, s = null;
				this.flowType === "pkce" && e.email != null && ([o, s] = await F(this.storage, this.storageKey));
				let { data: c, error: l } = await z(this.fetch, "PUT", `${this.url}/user`, {
					headers: this.headers,
					redirectTo: t?.emailRedirectTo,
					body: Object.assign(Object.assign({}, e), {
						code_challenge: o,
						code_challenge_method: s
					}),
					jwt: a.access_token,
					xform: V
				});
				if (l) throw l;
				return a.user = c.user, await this._saveSession(a), await this._notifyAllSubscribers("USER_UPDATED", a), this._returnResult({
					data: { user: a.user },
					error: null
				});
			});
		} catch (e) {
			if (await P(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
				data: { user: null },
				error: e
			});
			throw e;
		}
	}
	async setSession(e) {
		return await this.initializePromise, this.lock == null ? await this._setSession(e) : await this._acquireLock(this.lockAcquireTimeout, async () => await this._setSession(e));
	}
	async _setSession(e) {
		try {
			if (!e.access_token || !e.refresh_token) throw new j();
			let t = Date.now() / 1e3, n = t, r = !0, i = null, { payload: a } = fr(e.access_token);
			if (a.exp && (n = a.exp, r = n <= t), r) {
				let { data: t, error: n } = await this._callRefreshToken(e.refresh_token);
				if (n) return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: n
				});
				if (!t) return {
					data: {
						user: null,
						session: null
					},
					error: null
				};
				i = t;
			} else {
				let { data: r, error: a } = await this._getUser(e.access_token);
				if (a) return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: a
				});
				i = {
					access_token: e.access_token,
					refresh_token: e.refresh_token,
					user: r.user,
					token_type: "bearer",
					expires_in: n - t,
					expires_at: n
				}, await this._saveSession(i), await this._notifyAllSubscribers("SIGNED_IN", i);
			}
			return this._returnResult({
				data: {
					user: i.user,
					session: i
				},
				error: null
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					session: null,
					user: null
				},
				error: e
			});
			throw e;
		}
	}
	async refreshSession(e) {
		return await this.initializePromise, this.lock == null ? await this._refreshSession(e) : await this._acquireLock(this.lockAcquireTimeout, async () => await this._refreshSession(e));
	}
	async _refreshSession(e) {
		try {
			return await this._useSession(async (t) => {
				if (!e) {
					let { data: n, error: r } = t;
					if (r) throw r;
					e = n.session ?? void 0;
				}
				if (!e?.refresh_token) throw new j();
				let { data: n, error: r } = await this._callRefreshToken(e.refresh_token);
				return r ? this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: r
				}) : n ? this._returnResult({
					data: {
						user: n.user,
						session: n
					},
					error: null
				}) : this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: null
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: e
			});
			throw e;
		}
	}
	async _getSessionFromURL(e, t) {
		try {
			if (!M()) throw new Fn("No browser detected.");
			if (e.error || e.error_description || e.error_code) throw new Fn(e.error_description || "Error in URL with unspecified error_description", {
				error: e.error || "unspecified_error",
				code: e.error_code || "unspecified_code"
			});
			switch (t) {
				case "implicit":
					if (this.flowType === "pkce") throw new Ln("Not a valid PKCE flow url.");
					break;
				case "pkce":
					if (this.flowType === "implicit") throw new Fn("Not a valid implicit grant flow url.");
					break;
				default:
			}
			if (t === "pkce") {
				if (this._debug("#_initialize()", "begin", "is PKCE flow", !0), !e.code) throw new Ln("No code detected.");
				let { data: t, error: n } = await this._exchangeCodeForSession(e.code);
				if (n) throw n;
				let r = new URL(window.location.href);
				return r.searchParams.delete("code"), window.history.replaceState(window.history.state, "", r.toString()), {
					data: {
						session: t.session,
						redirectType: t.redirectType ?? null
					},
					error: null
				};
			}
			let { provider_token: n, provider_refresh_token: r, access_token: i, refresh_token: a, expires_in: o, expires_at: s, token_type: c } = e;
			if (!i || !o || !a || !c) throw new Fn("No session defined in URL");
			let l = Math.round(Date.now() / 1e3), u = parseInt(o), d = l + u;
			s && (d = parseInt(s));
			let f = d - l;
			f * 1e3 <= 3e4 && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${f}s, should have been closer to ${u}s`);
			let p = d - u;
			l - p >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", p, d, l) : l - p < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", p, d, l);
			let { data: m, error: h } = await this._getUser(i);
			if (h) throw h;
			let ee = {
				provider_token: n,
				provider_refresh_token: r,
				access_token: i,
				expires_in: u,
				expires_at: d,
				refresh_token: a,
				token_type: c,
				user: m.user
			};
			return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), this._returnResult({
				data: {
					session: ee,
					redirectType: e.type
				},
				error: null
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: {
					session: null,
					redirectType: null
				},
				error: e
			});
			throw e;
		}
	}
	_isImplicitGrantCallback(e) {
		return typeof this.detectSessionInUrl == "function" ? this.detectSessionInUrl(new URL(window.location.href), e) : !!(e.access_token || e.error || e.error_description || e.error_code);
	}
	async _isPKCECallback(e) {
		let t = await N(this.storage, `${this.storageKey}-code-verifier`);
		return !!(e.code && t);
	}
	async signOut(e = { scope: "global" }) {
		return await this.initializePromise, this.lock == null ? await this._signOut(e) : await this._acquireLock(this.lockAcquireTimeout, async () => await this._signOut(e));
	}
	async _signOut({ scope: e } = { scope: "global" }) {
		return await this._useSession(async (t) => {
			let n = async () => {
				await this._removeSession(), await P(this.storage, `${this.storageKey}-code-verifier`);
			}, { data: r, error: i } = t;
			if (i && !Mn(i)) return this._returnResult({ error: i });
			let a = r.session?.access_token;
			if (a) {
				let { error: t } = await this.admin.signOut(a, e);
				if (t && !(jn(t) && (t.status === 404 || t.status === 401 || t.status === 403) || Mn(t))) return e !== "others" && await n(), this._returnResult({ error: t });
			}
			return e !== "others" && await n(), this._returnResult({ error: null });
		});
	}
	onAuthStateChange(e) {
		let t = ir(), n = {
			id: t,
			callback: e,
			unsubscribe: () => {
				this._debug("#unsubscribe()", "state change callback with id removed", t), this.stateChangeEmitters.delete(t);
			}
		};
		return this._debug("#onAuthStateChange()", "registered callback with id", t), this.stateChangeEmitters.set(t, n), (async () => {
			await this.initializePromise, this.lock == null ? await this._emitInitialSession(t) : await this._acquireLock(this.lockAcquireTimeout, async () => {
				this._emitInitialSession(t);
			});
		})(), { data: { subscription: n } };
	}
	async _emitInitialSession(e) {
		return await this._useSession(async (t) => {
			try {
				let { data: { session: n }, error: r } = t;
				if (r) throw r;
				await this.stateChangeEmitters.get(e)?.callback("INITIAL_SESSION", n), this._debug("INITIAL_SESSION", "callback id", e, "session", n);
			} catch (t) {
				await this.stateChangeEmitters.get(e)?.callback("INITIAL_SESSION", null), this._debug("INITIAL_SESSION", "callback id", e, "error", t), Mn(t) ? console.warn(t) : console.error(t);
			}
		});
	}
	async resetPasswordForEmail(e, t = {}) {
		let n = null, r = null;
		this.flowType === "pkce" && ([n, r] = await F(this.storage, this.storageKey, !0));
		try {
			return await z(this.fetch, "POST", `${this.url}/recover`, {
				body: {
					email: e,
					code_challenge: n,
					code_challenge_method: r,
					gotrue_meta_security: { captcha_token: t.captchaToken }
				},
				headers: this.headers,
				redirectTo: t.redirectTo
			});
		} catch (e) {
			if (await P(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async getUserIdentities() {
		try {
			let { data: e, error: t } = await this.getUser();
			if (t) throw t;
			return this._returnResult({
				data: { identities: e.user.identities ?? [] },
				error: null
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async linkIdentity(e) {
		return "token" in e ? this.linkIdentityIdToken(e) : this.linkIdentityOAuth(e);
	}
	async linkIdentityOAuth(e) {
		try {
			let { data: t, error: n } = await this._useSession(async (t) => {
				let { data: n, error: r } = t;
				if (r) throw r;
				let i = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, e.provider, {
					redirectTo: e.options?.redirectTo,
					scopes: e.options?.scopes,
					queryParams: e.options?.queryParams,
					skipBrowserRedirect: !0
				});
				return await z(this.fetch, "GET", i, {
					headers: this.headers,
					jwt: n.session?.access_token ?? void 0
				});
			});
			if (n) throw n;
			return M() && !e.options?.skipBrowserRedirect && window.location.assign(t?.url), this._returnResult({
				data: {
					provider: e.provider,
					url: t?.url
				},
				error: null
			});
		} catch (t) {
			if (O(t)) return this._returnResult({
				data: {
					provider: e.provider,
					url: null
				},
				error: t
			});
			throw t;
		}
	}
	async linkIdentityIdToken(e) {
		return await this._useSession(async (t) => {
			try {
				let { error: n, data: { session: r } } = t;
				if (n) throw n;
				let { options: i, provider: a, token: o, access_token: s, nonce: c } = e, { data: l, error: u } = await z(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
					headers: this.headers,
					jwt: r?.access_token ?? void 0,
					body: {
						provider: a,
						id_token: o,
						access_token: s,
						nonce: c,
						link_identity: !0,
						gotrue_meta_security: { captcha_token: i?.captchaToken }
					},
					xform: B
				});
				return u ? this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: u
				}) : !l || !l.session || !l.user ? this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: new Nn()
				}) : (l.session && (await this._saveSession(l.session), await this._notifyAllSubscribers("USER_UPDATED", l.session)), this._returnResult({
					data: l,
					error: u
				}));
			} catch (e) {
				if (await P(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: e
				});
				throw e;
			}
		});
	}
	async unlinkIdentity(e) {
		try {
			return await this._useSession(async (t) => {
				let { data: n, error: r } = t;
				if (r) throw r;
				return await z(this.fetch, "DELETE", `${this.url}/user/identities/${e.identity_id}`, {
					headers: this.headers,
					jwt: n.session?.access_token ?? void 0
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _refreshAccessToken(e) {
		let t = "#_refreshAccessToken()";
		this._debug(t, "begin");
		try {
			let n = Date.now();
			return await mr(async (n) => (n > 0 && await pr(200 * 2 ** (n - 1)), this._debug(t, "refreshing attempt", n), await z(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
				body: { refresh_token: e },
				headers: this.headers,
				xform: B
			})), (e, t) => {
				let r = 200 * 2 ** e;
				return t && Bn(t) && Date.now() + r - n < 3e4;
			});
		} catch (e) {
			if (this._debug(t, "error", e), O(e)) return this._returnResult({
				data: {
					session: null,
					user: null
				},
				error: e
			});
			throw e;
		} finally {
			this._debug(t, "end");
		}
	}
	_isValidSession(e) {
		return typeof e == "object" && !!e && "access_token" in e && "refresh_token" in e && "expires_at" in e;
	}
	async _handleProviderSignIn(e, t) {
		let n = await this._getUrlForProvider(`${this.url}/authorize`, e, {
			redirectTo: t.redirectTo,
			scopes: t.scopes,
			queryParams: t.queryParams
		});
		return this._debug("#_handleProviderSignIn()", "provider", e, "options", t, "url", n), M() && !t.skipBrowserRedirect && window.location.assign(n), {
			data: {
				provider: e,
				url: n
			},
			error: null
		};
	}
	async _recoverAndRefresh() {
		let e = "#_recoverAndRefresh()";
		this._debug(e, "begin");
		try {
			let t = await N(this.storage, this.storageKey);
			if (t && this.userStorage) {
				let e = await N(this.userStorage, this.storageKey + "-user");
				!this.storage.isServer && Object.is(this.storage, this.userStorage) && !e && (e = { user: t.user }, await ur(this.userStorage, this.storageKey + "-user", e)), t.user = e?.user ?? wr();
			} else if (t && !t.user && !t.user) {
				let e = await N(this.storage, this.storageKey + "-user");
				e && e?.user ? (t.user = e.user, await P(this.storage, this.storageKey + "-user"), await ur(this.storage, this.storageKey, t)) : t.user = wr();
			}
			if (this._debug(e, "session from storage", t), !this._isValidSession(t)) {
				this._debug(e, "session is not valid"), t !== null && await this._removeSession();
				return;
			}
			let n = (t.expires_at ?? Infinity) * 1e3 - Date.now() < xn;
			if (this._debug(e, `session has${n ? "" : " not"} expired with margin of ${xn}s`), n) {
				if (this.autoRefreshToken && t.refresh_token) {
					let { error: n } = await this._callRefreshToken(t.refresh_token);
					n && (Hn(n) ? this._debug(e, "refresh discarded by commit guard", n) : this._debug(e, "refresh failed", n));
				}
			} else if (t.user && t.user.__isUserNotAvailableProxy === !0) try {
				let { data: n, error: r } = await this._getUser(t.access_token);
				!r && n?.user ? (t.user = n.user, await this._saveSession(t), await this._notifyAllSubscribers("SIGNED_IN", t)) : this._debug(e, "could not get user data, skipping SIGNED_IN notification");
			} catch (t) {
				console.error("Error getting user data:", t), this._debug(e, "error getting user data, skipping SIGNED_IN notification", t);
			}
			else await this._notifyAllSubscribers("SIGNED_IN", t);
		} catch (t) {
			this._debug(e, "error", t), console.error(t);
			return;
		} finally {
			this._debug(e, "end");
		}
	}
	async _callRefreshToken(e) {
		var t, n;
		if (!e) throw new j();
		if (this.refreshingDeferred) return this.refreshingDeferred.promise;
		if (this.lastRefreshFailure && this.lastRefreshFailure.refreshToken === e && Date.now() < this.lastRefreshFailure.expiresAt) return this._debug("#_callRefreshToken()", "returning cached failure (cooldown active)"), this.lastRefreshFailure.result;
		let r = "#_callRefreshToken()";
		this._debug(r, "begin");
		try {
			this.refreshingDeferred = new dr();
			let t = await N(this.storage, this.storageKey), { data: n, error: i } = await this._refreshAccessToken(e);
			if (i) throw i;
			if (!n.session) throw new j();
			let a = await N(this.storage, this.storageKey);
			if (t !== null && (a === null || a.refresh_token !== t.refresh_token)) {
				this._debug(r, "commit guard: storage changed since refresh started, discarding rotated tokens", {
					startedWith: "present",
					nowHolds: a ? "replaced" : "cleared"
				});
				let e = {
					data: null,
					error: new Vn()
				};
				return this.refreshingDeferred.resolve(e), e;
			}
			let o = this._sessionRemovalEpoch;
			if (await this._saveSession(n.session), this._sessionRemovalEpoch !== o) {
				this._debug(r, "commit guard (post-save): _removeSession ran during _saveSession, undoing write"), await P(this.storage, this.storageKey), this.userStorage && await P(this.userStorage, this.storageKey + "-user");
				let e = {
					data: null,
					error: new Vn()
				};
				return this.refreshingDeferred.resolve(e), e;
			}
			await this._notifyAllSubscribers("TOKEN_REFRESHED", n.session);
			let s = {
				data: n.session,
				error: null
			};
			return this.lastRefreshFailure = null, this.refreshingDeferred.resolve(s), s;
		} catch (i) {
			if (this._debug(r, "error", i), O(i)) {
				let n = {
					data: null,
					error: i
				};
				if (!Bn(i)) {
					let e = await N(this.storage, this.storageKey);
					e?.expires_at && e.expires_at * 1e3 > Date.now() ? this._debug(r, "proactive refresh failed, access token still valid — preserving session") : await this._removeSession();
				}
				return this.lastRefreshFailure = {
					refreshToken: e,
					result: n,
					expiresAt: Date.now() + Sn
				}, (t = this.refreshingDeferred) == null || t.resolve(n), n;
			}
			throw (n = this.refreshingDeferred) == null || n.reject(i), i;
		} finally {
			this.refreshingDeferred = null, this._debug(r, "end");
		}
	}
	async _notifyAllSubscribers(e, t, n = !0) {
		if (this._pendingInitNotifications !== null && n) {
			this._pendingInitNotifications.push({
				event: e,
				session: t,
				broadcast: n
			});
			return;
		}
		let r = `#_notifyAllSubscribers(${e})`;
		this._debug(r, "begin", t, `broadcast = ${n}`);
		try {
			this.broadcastChannel && n && this.broadcastChannel.postMessage({
				event: e,
				session: t
			});
			let r = [], i = Array.from(this.stateChangeEmitters.values()).map(async (n) => {
				try {
					await n.callback(e, t);
				} catch (e) {
					r.push(e);
				}
			});
			if (await Promise.all(i), r.length > 0) {
				for (let e = 0; e < r.length; e += 1) console.error(r[e]);
				throw r[0];
			}
		} finally {
			this._debug(r, "end");
		}
	}
	async _saveSession(e) {
		this._debug("#_saveSession()", e), this.suppressGetSessionWarning = !0;
		let t = Object.assign({}, e), n = t.user && t.user.__isUserNotAvailableProxy === !0;
		if (this.userStorage) {
			!n && t.user && await ur(this.userStorage, this.storageKey + "-user", { user: t.user });
			let e = Object.assign({}, t);
			delete e.user;
			let r = Er(e);
			await ur(this.storage, this.storageKey, r);
		} else {
			let e = Er(t);
			await ur(this.storage, this.storageKey, e);
		}
	}
	async _removeSession() {
		this._sessionRemovalEpoch += 1, this._debug("#_removeSession()"), this.lastRefreshFailure = null, this.suppressGetSessionWarning = !1, await P(this.storage, this.storageKey), await P(this.storage, this.storageKey + "-code-verifier"), await P(this.storage, this.storageKey + "-user"), this.userStorage && await P(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
	}
	_removeVisibilityChangedCallback() {
		this._debug("#_removeVisibilityChangedCallback()");
		let e = this.visibilityChangedCallback;
		this.visibilityChangedCallback = null;
		try {
			e && M() && window != null && window.removeEventListener && window.removeEventListener("visibilitychange", e);
		} catch (e) {
			console.error("removing visibilitychange callback failed", e);
		}
	}
	async _startAutoRefresh() {
		await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()");
		let e = setInterval(() => this._autoRefreshTokenTick(), bn);
		this.autoRefreshTicker = e, e && typeof e == "object" && typeof e.unref == "function" ? e.unref() : typeof Deno < "u" && typeof Deno.unrefTimer == "function" && Deno.unrefTimer(e);
		let t = setTimeout(async () => {
			await this.initializePromise, await this._autoRefreshTokenTick();
		}, 0);
		this.autoRefreshTickTimeout = t, t && typeof t == "object" && typeof t.unref == "function" ? t.unref() : typeof Deno < "u" && typeof Deno.unrefTimer == "function" && Deno.unrefTimer(t);
	}
	async _stopAutoRefresh() {
		this._debug("#_stopAutoRefresh()");
		let e = this.autoRefreshTicker;
		this.autoRefreshTicker = null, e && clearInterval(e);
		let t = this.autoRefreshTickTimeout;
		this.autoRefreshTickTimeout = null, t && clearTimeout(t);
	}
	async startAutoRefresh() {
		this._removeVisibilityChangedCallback(), await this._startAutoRefresh();
	}
	async stopAutoRefresh() {
		this._removeVisibilityChangedCallback(), await this._stopAutoRefresh();
	}
	async dispose() {
		var e;
		this._removeVisibilityChangedCallback(), await this._stopAutoRefresh(), (e = this.broadcastChannel) == null || e.close(), this.broadcastChannel = null, this.stateChangeEmitters.clear();
	}
	async _autoRefreshTokenTick() {
		if (this._debug("#_autoRefreshTokenTick()", "begin"), this.lock != null) {
			try {
				await this._acquireLock(0, async () => {
					try {
						let e = Date.now();
						try {
							return await this._useSession(async (t) => {
								let { data: { session: n } } = t;
								if (!n || !n.refresh_token || !n.expires_at) {
									this._debug("#_autoRefreshTokenTick()", "no session");
									return;
								}
								let r = Math.floor((n.expires_at * 1e3 - e) / bn);
								this._debug("#_autoRefreshTokenTick()", `access token expires in ${r} ticks, a tick lasts ${bn}ms, refresh threshold is 3 ticks`), r <= 3 && await this._callRefreshToken(n.refresh_token);
							});
						} catch (e) {
							console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
						}
					} finally {
						this._debug("#_autoRefreshTokenTick()", "end");
					}
				});
			} catch (e) {
				if (e instanceof zr) this._debug("auto refresh token tick lock not available");
				else throw e;
			}
			return;
		}
		if (this.refreshingDeferred !== null) {
			this._debug("#_autoRefreshTokenTick()", "refresh already in flight, skipping");
			return;
		}
		try {
			let e = Date.now();
			try {
				await this._useSession(async (t) => {
					let { data: { session: n } } = t;
					if (!n || !n.refresh_token || !n.expires_at) {
						this._debug("#_autoRefreshTokenTick()", "no session");
						return;
					}
					let r = Math.floor((n.expires_at * 1e3 - e) / bn);
					this._debug("#_autoRefreshTokenTick()", `access token expires in ${r} ticks, a tick lasts ${bn}ms, refresh threshold is 3 ticks`), r <= 3 && await this._callRefreshToken(n.refresh_token);
				});
			} catch (e) {
				console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
			}
		} finally {
			this._debug("#_autoRefreshTokenTick()", "end");
		}
	}
	async _handleVisibilityChange() {
		if (this._debug("#_handleVisibilityChange()"), !M() || !(window != null && window.addEventListener)) return this.autoRefreshToken && this.startAutoRefresh(), !1;
		try {
			this.visibilityChangedCallback = async () => {
				try {
					await this._onVisibilityChanged(!1);
				} catch (e) {
					this._debug("#visibilityChangedCallback", "error", e);
				}
			}, window == null || window.addEventListener("visibilitychange", this.visibilityChangedCallback), await this._onVisibilityChanged(!0);
		} catch (e) {
			console.error("_handleVisibilityChange", e);
		}
	}
	async _onVisibilityChanged(e) {
		let t = `#_onVisibilityChanged(${e})`;
		if (this._debug(t, "visibilityState", document.visibilityState), document.visibilityState === "visible") {
			if (this.autoRefreshToken && this._startAutoRefresh(), !e) if (await this.initializePromise, this.lock != null) await this._acquireLock(this.lockAcquireTimeout, async () => {
				if (document.visibilityState !== "visible") {
					this._debug(t, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
					return;
				}
				await this._recoverAndRefresh();
			});
			else {
				if (document.visibilityState !== "visible") {
					this._debug(t, "visibilityState is no longer visible, skipping recovery");
					return;
				}
				await this._recoverAndRefresh();
			}
		} else document.visibilityState === "hidden" && this.autoRefreshToken && this._stopAutoRefresh();
	}
	async _getUrlForProvider(e, t, n) {
		let r = [`provider=${encodeURIComponent(t)}`];
		if (n?.redirectTo && r.push(`redirect_to=${encodeURIComponent(n.redirectTo)}`), n?.scopes && r.push(`scopes=${encodeURIComponent(n.scopes)}`), this.flowType === "pkce") {
			let [e, t] = await F(this.storage, this.storageKey), n = new URLSearchParams({
				code_challenge: `${encodeURIComponent(e)}`,
				code_challenge_method: `${encodeURIComponent(t)}`
			});
			r.push(n.toString());
		}
		if (n?.queryParams) {
			let e = new URLSearchParams(n.queryParams);
			r.push(e.toString());
		}
		return n?.skipBrowserRedirect && r.push(`skip_http_redirect=${n.skipBrowserRedirect}`), `${e}?${r.join("&")}`;
	}
	async _unenroll(e) {
		try {
			return await this._useSession(async (t) => {
				let { data: n, error: r } = t;
				return r ? this._returnResult({
					data: null,
					error: r
				}) : await z(this.fetch, "DELETE", `${this.url}/factors/${e.factorId}`, {
					headers: this.headers,
					jwt: n?.session?.access_token
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _enroll(e) {
		try {
			return await this._useSession(async (t) => {
				let { data: n, error: r } = t;
				if (r) return this._returnResult({
					data: null,
					error: r
				});
				let i = Object.assign({
					friendly_name: e.friendlyName,
					factor_type: e.factorType
				}, e.factorType === "phone" ? { phone: e.phone } : e.factorType === "totp" ? { issuer: e.issuer } : {}), { data: a, error: o } = await z(this.fetch, "POST", `${this.url}/factors`, {
					body: i,
					headers: this.headers,
					jwt: n?.session?.access_token
				});
				return o ? this._returnResult({
					data: null,
					error: o
				}) : (e.factorType === "totp" && a.type === "totp" && a?.totp?.qr_code && (a.totp.qr_code = `data:image/svg+xml;utf-8,${a.totp.qr_code}`), this._returnResult({
					data: a,
					error: null
				}));
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _verify(e) {
		let t = async () => {
			try {
				return await this._useSession(async (t) => {
					let { data: n, error: r } = t;
					if (r) return this._returnResult({
						data: null,
						error: r
					});
					let i = Object.assign({ challenge_id: e.challengeId }, "webauthn" in e ? { webauthn: Object.assign(Object.assign({}, e.webauthn), { credential_response: e.webauthn.type === "create" ? Zr(e.webauthn.credential_response) : Qr(e.webauthn.credential_response) }) } : { code: e.code }), { data: a, error: o } = await z(this.fetch, "POST", `${this.url}/factors/${e.factorId}/verify`, {
						body: i,
						headers: this.headers,
						jwt: n?.session?.access_token
					});
					return o ? this._returnResult({
						data: null,
						error: o
					}) : (await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + a.expires_in }, a)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", a), this._returnResult({
						data: a,
						error: o
					}));
				});
			} catch (e) {
				if (O(e)) return this._returnResult({
					data: null,
					error: e
				});
				throw e;
			}
		};
		return this.lock == null ? t() : this._acquireLock(this.lockAcquireTimeout, t);
	}
	async _challenge(e) {
		let t = async () => {
			try {
				return await this._useSession(async (t) => {
					let { data: n, error: r } = t;
					if (r) return this._returnResult({
						data: null,
						error: r
					});
					let i = await z(this.fetch, "POST", `${this.url}/factors/${e.factorId}/challenge`, {
						body: e,
						headers: this.headers,
						jwt: n?.session?.access_token
					});
					if (i.error) return i;
					let { data: a } = i;
					if (a.type !== "webauthn") return {
						data: a,
						error: null
					};
					switch (a.webauthn.type) {
						case "create": return {
							data: Object.assign(Object.assign({}, a), { webauthn: Object.assign(Object.assign({}, a.webauthn), { credential_options: Object.assign(Object.assign({}, a.webauthn.credential_options), { publicKey: Yr(a.webauthn.credential_options.publicKey) }) }) }),
							error: null
						};
						case "request": return {
							data: Object.assign(Object.assign({}, a), { webauthn: Object.assign(Object.assign({}, a.webauthn), { credential_options: Object.assign(Object.assign({}, a.webauthn.credential_options), { publicKey: Xr(a.webauthn.credential_options.publicKey) }) }) }),
							error: null
						};
					}
				});
			} catch (e) {
				if (O(e)) return this._returnResult({
					data: null,
					error: e
				});
				throw e;
			}
		};
		return this.lock == null ? t() : this._acquireLock(this.lockAcquireTimeout, t);
	}
	async _challengeAndVerify(e) {
		let { data: t, error: n } = await this._challenge({ factorId: e.factorId });
		return n ? this._returnResult({
			data: null,
			error: n
		}) : await this._verify({
			factorId: e.factorId,
			challengeId: t.id,
			code: e.code
		});
	}
	async _listFactors() {
		let { data: { user: e }, error: t } = await this.getUser();
		if (t) return {
			data: null,
			error: t
		};
		let n = {
			all: [],
			phone: [],
			totp: [],
			webauthn: []
		};
		for (let t of e?.factors ?? []) n.all.push(t), t.status === "verified" && n[t.factor_type].push(t);
		return {
			data: n,
			error: null
		};
	}
	async _getAuthenticatorAssuranceLevel(e) {
		if (e) try {
			let { payload: t } = fr(e), n = null;
			t.aal && (n = t.aal);
			let r = n, { data: { user: i }, error: a } = await this.getUser(e);
			if (a) return this._returnResult({
				data: null,
				error: a
			});
			((i?.factors)?.filter((e) => e.status === "verified") ?? []).length > 0 && (r = "aal2");
			let o = t.amr || [];
			return {
				data: {
					currentLevel: n,
					nextLevel: r,
					currentAuthenticationMethods: o
				},
				error: null
			};
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
		let { data: { session: t }, error: n } = await this.getSession();
		if (n) return this._returnResult({
			data: null,
			error: n
		});
		if (!t) return {
			data: {
				currentLevel: null,
				nextLevel: null,
				currentAuthenticationMethods: []
			},
			error: null
		};
		let { payload: r } = fr(t.access_token), i = null;
		r.aal && (i = r.aal);
		let a = i;
		(t.user.factors?.filter((e) => e.status === "verified") ?? []).length > 0 && (a = "aal2");
		let o = r.amr || [];
		return {
			data: {
				currentLevel: i,
				nextLevel: a,
				currentAuthenticationMethods: o
			},
			error: null
		};
	}
	async _getAuthorizationDetails(e) {
		try {
			return await this._useSession(async (t) => {
				let { data: { session: n }, error: r } = t;
				return r ? this._returnResult({
					data: null,
					error: r
				}) : n ? await z(this.fetch, "GET", `${this.url}/oauth/authorizations/${e}`, {
					headers: this.headers,
					jwt: n.access_token,
					xform: (e) => ({
						data: e,
						error: null
					})
				}) : this._returnResult({
					data: null,
					error: new j()
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _approveAuthorization(e, t) {
		try {
			return await this._useSession(async (n) => {
				let { data: { session: r }, error: i } = n;
				if (i) return this._returnResult({
					data: null,
					error: i
				});
				if (!r) return this._returnResult({
					data: null,
					error: new j()
				});
				let a = await z(this.fetch, "POST", `${this.url}/oauth/authorizations/${e}/consent`, {
					headers: this.headers,
					jwt: r.access_token,
					body: { action: "approve" },
					xform: (e) => ({
						data: e,
						error: null
					})
				});
				return a.data && a.data.redirect_url && M() && !t?.skipBrowserRedirect && window.location.assign(a.data.redirect_url), a;
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _denyAuthorization(e, t) {
		try {
			return await this._useSession(async (n) => {
				let { data: { session: r }, error: i } = n;
				if (i) return this._returnResult({
					data: null,
					error: i
				});
				if (!r) return this._returnResult({
					data: null,
					error: new j()
				});
				let a = await z(this.fetch, "POST", `${this.url}/oauth/authorizations/${e}/consent`, {
					headers: this.headers,
					jwt: r.access_token,
					body: { action: "deny" },
					xform: (e) => ({
						data: e,
						error: null
					})
				});
				return a.data && a.data.redirect_url && M() && !t?.skipBrowserRedirect && window.location.assign(a.data.redirect_url), a;
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _listOAuthGrants() {
		try {
			return await this._useSession(async (e) => {
				let { data: { session: t }, error: n } = e;
				return n ? this._returnResult({
					data: null,
					error: n
				}) : t ? await z(this.fetch, "GET", `${this.url}/user/oauth/grants`, {
					headers: this.headers,
					jwt: t.access_token,
					xform: (e) => ({
						data: e,
						error: null
					})
				}) : this._returnResult({
					data: null,
					error: new j()
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _revokeOAuthGrant(e) {
		try {
			return await this._useSession(async (t) => {
				let { data: { session: n }, error: r } = t;
				return r ? this._returnResult({
					data: null,
					error: r
				}) : n ? (await z(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, {
					headers: this.headers,
					jwt: n.access_token,
					query: { client_id: e.clientId },
					noResolveJson: !0
				}), {
					data: {},
					error: null
				}) : this._returnResult({
					data: null,
					error: new j()
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async fetchJwk(e, t = { keys: [] }) {
		let n = t.keys.find((t) => t.kid === e);
		if (n) return n;
		let r = Date.now();
		if (n = this.jwks.keys.find((t) => t.kid === e), n && this.jwks_cached_at + 6e5 > r) return n;
		let { data: i, error: a } = await z(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, { headers: this.headers });
		if (a) throw a;
		return !i.keys || i.keys.length === 0 || (this.jwks = i, this.jwks_cached_at = r, n = i.keys.find((t) => t.kid === e), !n) ? null : n;
	}
	async getClaims(e, t = {}) {
		try {
			let n = e;
			if (!n) {
				let { data: e, error: t } = await this.getSession();
				if (t || !e.session) return this._returnResult({
					data: null,
					error: t
				});
				n = e.session.access_token;
			}
			let { header: r, payload: i, signature: a, raw: { header: o, payload: s } } = fr(n);
			if (!t?.allowExpired) try {
				xr(i.exp);
			} catch (e) {
				throw new Wn(e instanceof Error ? e.message : "JWT validation failed");
			}
			let c = !r.alg || r.alg.startsWith("HS") || !r.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(r.kid, t?.keys ? { keys: t.keys } : t?.jwks);
			if (!c) {
				let { error: e } = await this.getUser(n);
				if (e) throw e;
				return {
					data: {
						claims: i,
						header: r,
						signature: a
					},
					error: null
				};
			}
			let l = Sr(r.alg), u = await crypto.subtle.importKey("jwk", c, l, !0, ["verify"]);
			if (!await crypto.subtle.verify(l, u, a, tr(`${o}.${s}`))) throw new Wn("Invalid JWT signature");
			return {
				data: {
					claims: i,
					header: r,
					signature: a
				},
				error: null
			};
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async signInWithPasskey(e) {
		L(this.experimental);
		try {
			if (!ei()) return this._returnResult({
				data: null,
				error: new k("Browser does not support WebAuthn", null)
			});
			let { data: t, error: n } = await this._startPasskeyAuthentication({ options: { captchaToken: e?.options?.captchaToken } });
			if (n || !t) return this._returnResult({
				data: null,
				error: n
			});
			let { data: r, error: i } = await ni({
				publicKey: Xr(t.options),
				signal: e?.options?.signal ?? Jr.createNewAbortSignal()
			});
			if (i || !r) return this._returnResult({
				data: null,
				error: i ?? new k("WebAuthn ceremony failed", null)
			});
			let a = Qr(r);
			return this._verifyPasskeyAuthentication({
				challengeId: t.challenge_id,
				credential: a
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async registerPasskey(e) {
		L(this.experimental);
		try {
			if (!ei()) return this._returnResult({
				data: null,
				error: new k("Browser does not support WebAuthn", null)
			});
			let { data: t, error: n } = await this._startPasskeyRegistration();
			if (n || !t) return this._returnResult({
				data: null,
				error: n
			});
			let { data: r, error: i } = await ti({
				publicKey: Yr(t.options),
				signal: e?.options?.signal ?? Jr.createNewAbortSignal()
			});
			if (i || !r) return this._returnResult({
				data: null,
				error: i ?? new k("WebAuthn ceremony failed", null)
			});
			let a = Zr(r);
			return this._verifyPasskeyRegistration({
				challengeId: t.challenge_id,
				credential: a
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _startPasskeyRegistration() {
		L(this.experimental);
		try {
			return await this._useSession(async (e) => {
				let { data: { session: t }, error: n } = e;
				if (n) return this._returnResult({
					data: null,
					error: n
				});
				if (!t) return this._returnResult({
					data: null,
					error: new j()
				});
				let { data: r, error: i } = await z(this.fetch, "POST", `${this.url}/passkeys/registration/options`, {
					headers: this.headers,
					jwt: t.access_token,
					body: {}
				});
				return i ? this._returnResult({
					data: null,
					error: i
				}) : this._returnResult({
					data: r,
					error: null
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _verifyPasskeyRegistration(e) {
		L(this.experimental);
		try {
			return await this._useSession(async (t) => {
				let { data: { session: n }, error: r } = t;
				if (r) return this._returnResult({
					data: null,
					error: r
				});
				if (!n) return this._returnResult({
					data: null,
					error: new j()
				});
				let { data: i, error: a } = await z(this.fetch, "POST", `${this.url}/passkeys/registration/verify`, {
					headers: this.headers,
					jwt: n.access_token,
					body: {
						challenge_id: e.challengeId,
						credential: e.credential
					}
				});
				return a ? this._returnResult({
					data: null,
					error: a
				}) : this._returnResult({
					data: i,
					error: null
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _startPasskeyAuthentication(e) {
		L(this.experimental);
		try {
			let { data: t, error: n } = await z(this.fetch, "POST", `${this.url}/passkeys/authentication/options`, {
				headers: this.headers,
				body: { gotrue_meta_security: { captcha_token: e?.options?.captchaToken } }
			});
			return n ? this._returnResult({
				data: null,
				error: n
			}) : this._returnResult({
				data: t,
				error: null
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _verifyPasskeyAuthentication(e) {
		L(this.experimental);
		try {
			let { data: t, error: n } = await z(this.fetch, "POST", `${this.url}/passkeys/authentication/verify`, {
				headers: this.headers,
				body: {
					challenge_id: e.challengeId,
					credential: e.credential
				},
				xform: B
			});
			return n ? this._returnResult({
				data: null,
				error: n
			}) : (t.session && (await this._saveSession(t.session), await this._notifyAllSubscribers("SIGNED_IN", t.session)), this._returnResult({
				data: t,
				error: null
			}));
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _listPasskeys() {
		L(this.experimental);
		try {
			return await this._useSession(async (e) => {
				let { data: { session: t }, error: n } = e;
				if (n) return this._returnResult({
					data: null,
					error: n
				});
				if (!t) return this._returnResult({
					data: null,
					error: new j()
				});
				let { data: r, error: i } = await z(this.fetch, "GET", `${this.url}/passkeys`, {
					headers: this.headers,
					jwt: t.access_token,
					xform: (e) => ({
						data: e,
						error: null
					})
				});
				return i ? this._returnResult({
					data: null,
					error: i
				}) : this._returnResult({
					data: r,
					error: null
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _updatePasskey(e) {
		L(this.experimental);
		try {
			return await this._useSession(async (t) => {
				let { data: { session: n }, error: r } = t;
				if (r) return this._returnResult({
					data: null,
					error: r
				});
				if (!n) return this._returnResult({
					data: null,
					error: new j()
				});
				let { data: i, error: a } = await z(this.fetch, "PATCH", `${this.url}/passkeys/${e.passkeyId}`, {
					headers: this.headers,
					jwt: n.access_token,
					body: { friendly_name: e.friendlyName }
				});
				return a ? this._returnResult({
					data: null,
					error: a
				}) : this._returnResult({
					data: i,
					error: null
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
	async _deletePasskey(e) {
		L(this.experimental);
		try {
			return await this._useSession(async (t) => {
				let { data: { session: n }, error: r } = t;
				if (r) return this._returnResult({
					data: null,
					error: r
				});
				if (!n) return this._returnResult({
					data: null,
					error: new j()
				});
				let { error: i } = await z(this.fetch, "DELETE", `${this.url}/passkeys/${e.passkeyId}`, {
					headers: this.headers,
					jwt: n.access_token,
					noResolveJson: !0
				});
				return i ? this._returnResult({
					data: null,
					error: i
				}) : this._returnResult({
					data: null,
					error: null
				});
			});
		} catch (e) {
			if (O(e)) return this._returnResult({
				data: null,
				error: e
			});
			throw e;
		}
	}
};
di.nextInstanceID = {};
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/AuthClient.js
var fi = di, pi = "2.110.3", mi = "", hi;
typeof Deno < "u" ? (mi = "deno", hi = Deno.version?.deno) : typeof document < "u" ? mi = "web" : typeof navigator < "u" && navigator.product === "ReactNative" ? mi = "react-native" : (mi = "node", hi = typeof process < "u" ? process.version?.replace(/^v/, "") : void 0);
var gi = [`runtime=${mi}`];
hi && gi.push(`runtime-version=${hi}`);
var _i = { headers: { "X-Client-Info": `supabase-js/${pi}; ${gi.join("; ")}` } }, vi = { schema: "public" }, yi = {
	autoRefreshToken: !0,
	persistSession: !0,
	detectSessionInUrl: !0,
	flowType: "implicit"
}, bi = {}, xi = {
	enabled: !1,
	respectSamplingDecision: !0
};
function Si(e, t, n, r) {
	function i(e) {
		return e instanceof n ? e : new n(function(t) {
			t(e);
		});
	}
	return new (n ||= Promise)(function(n, a) {
		function o(e) {
			try {
				c(r.next(e));
			} catch (e) {
				a(e);
			}
		}
		function s(e) {
			try {
				c(r.throw(e));
			} catch (e) {
				a(e);
			}
		}
		function c(e) {
			e.done ? n(e.value) : i(e.value).then(o, s);
		}
		c((r = r.apply(e, t || [])).next());
	});
}
var Ci = null, wi = "@opentelemetry/api";
function Ti() {
	return Ci === null && (Ci = import(
		/* webpackIgnore: true */
		/* turbopackIgnore: true */
		/* @vite-ignore */
		wi
).catch(() => null)), Ci;
}
function Ei() {
	return Si(this, void 0, void 0, function* () {
		try {
			let e = yield Ti();
			if (!e || !e.propagation || !e.context) return null;
			let t = {};
			e.propagation.inject(e.context.active(), t);
			let n = t.traceparent;
			return n ? {
				traceparent: n,
				tracestate: t.tracestate,
				baggage: t.baggage
			} : null;
		} catch {
			return null;
		}
	});
}
function Di(e) {
	if (!e || typeof e != "string") return null;
	let t = e.split("-");
	if (t.length !== 4) return null;
	let [n, r, i, a] = t;
	if (n.length !== 2 || r.length !== 32 || i.length !== 16 || a.length !== 2) return null;
	let o = /^[0-9a-f]+$/i;
	return !o.test(n) || !o.test(r) || !o.test(i) || !o.test(a) || r === "00000000000000000000000000000000" || i === "0000000000000000" ? null : {
		version: n,
		traceId: r,
		parentId: i,
		traceFlags: a,
		isSampled: (parseInt(a, 16) & 1) == 1
	};
}
function Oi(e, t) {
	if (!e || !t || t.length === 0) return !1;
	let n;
	if (e instanceof URL) n = e;
	else try {
		n = new URL(e);
	} catch {
		return !1;
	}
	for (let e of t) try {
		if (typeof e == "string") {
			if (ki(n.hostname, e)) return !0;
		} else if (e instanceof RegExp) {
			if (e.test(n.hostname)) return !0;
		} else if (typeof e == "function" && e(n)) return !0;
	} catch {
		continue;
	}
	return !1;
}
function ki(e, t) {
	if (t === e) return !0;
	if (t.startsWith("*.")) {
		let n = t.slice(2);
		if (e.endsWith(n) && (e === n || e.endsWith("." + n))) return !0;
	}
	return !1;
}
function Ai(e) {
	let t = [];
	try {
		let n = new URL(e);
		t.push(n.hostname);
	} catch {}
	return t.push("*.supabase.co", "*.supabase.in"), t.push("localhost", "127.0.0.1", "[::1]"), t;
}
function ji(e) {
	"@babel/helpers - typeof";
	return ji = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, ji(e);
}
function Mi(e, t) {
	if (ji(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (ji(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Ni(e) {
	var t = Mi(e, "string");
	return ji(t) == "symbol" ? t : t + "";
}
function Pi(e, t, n) {
	return (t = Ni(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Fi(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function U(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Fi(Object(n), !0).forEach(function(t) {
			Pi(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Fi(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
var Ii = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), Li = () => Headers, Ri = (e, t, n, r, i) => {
	let a = Ii(r), o = Li(), s = i?.enabled === !0, c = i?.respectSamplingDecision !== !1, l = s ? Ai(t) : null;
	return async (t, r) => {
		let i = await n() ?? e, s = new o(r?.headers);
		if (s.has("apikey") || s.set("apikey", e), s.has("Authorization") || s.set("Authorization", `Bearer ${i}`), l) {
			let e = await zi(t, l, c);
			e && (e.traceparent && !s.has("traceparent") && s.set("traceparent", e.traceparent), e.tracestate && !s.has("tracestate") && s.set("tracestate", e.tracestate), e.baggage && !s.has("baggage") && s.set("baggage", e.baggage));
		}
		return a(t, U(U({}, r), {}, { headers: s }));
	};
};
async function zi(e, t, n) {
	if (!Oi(typeof e == "string" || e instanceof URL ? e : e.url, t)) return null;
	let r = await Ei();
	if (!r || !r.traceparent) return null;
	if (n) {
		let e = Di(r.traceparent);
		if (e && !e.isSampled) return null;
	}
	return r;
}
function Bi(e) {
	return typeof e == "boolean" ? { enabled: e } : e;
}
function Vi(e) {
	return e.endsWith("/") ? e : e + "/";
}
function Hi(e, t) {
	let { db: n, auth: r, realtime: i, global: a } = e, { db: o, auth: s, realtime: c, global: l } = t, u = Bi(e.tracePropagation), d = Bi(t.tracePropagation), f = {
		db: U(U({}, o), n),
		auth: U(U({}, s), r),
		realtime: U(U({}, c), i),
		storage: {},
		global: U(U(U({}, l), a), {}, { headers: U(U({}, l?.headers ?? {}), a?.headers ?? {}) }),
		tracePropagation: {
			enabled: u?.enabled ?? d?.enabled ?? !1,
			respectSamplingDecision: u?.respectSamplingDecision ?? d?.respectSamplingDecision ?? !0
		},
		accessToken: async () => ""
	};
	return e.accessToken ? f.accessToken = e.accessToken : delete f.accessToken, f;
}
function Ui(e) {
	let t = e?.trim();
	if (!t) throw Error("supabaseUrl is required.");
	if (!t.match(/^https?:\/\//i)) throw Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
	try {
		return new URL(Vi(t));
	} catch {
		throw Error("Invalid supabaseUrl: Provided URL is malformed.");
	}
}
var Wi = class extends fi {
	constructor(e) {
		super(e);
	}
}, Gi = class {
	constructor(e, t, n) {
		this.supabaseUrl = e, this.supabaseKey = t;
		let r = Ui(e);
		if (!t) throw Error("supabaseKey is required.");
		this.realtimeUrl = new URL("realtime/v1", r), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", r), this.storageUrl = new URL("storage/v1", r), this.functionsUrl = new URL("functions/v1", r);
		let i = `sb-${r.hostname.split(".")[0]}-auth-token`, a = {
			db: vi,
			realtime: bi,
			auth: U(U({}, yi), {}, { storageKey: i }),
			global: _i,
			tracePropagation: xi
		}, o = Hi(n ?? {}, a);
		this.settings = o, this.storageKey = o.auth.storageKey ?? "", this.headers = o.global.headers ?? {}, o.accessToken ? (this.accessToken = o.accessToken, this.auth = new Proxy({}, { get: (e, t) => {
			throw Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(t)} is not possible`);
		} })) : this.auth = this._initSupabaseAuthClient(o.auth ?? {}, this.headers, o.global.fetch), this.fetch = Ri(t, e, this._getAccessToken.bind(this), o.global.fetch, o.tracePropagation), this.realtime = this._initRealtimeClient(U({
			headers: this.headers,
			accessToken: this._getAccessToken.bind(this),
			fetch: this.fetch
		}, o.realtime)), this.accessToken && Promise.resolve(this.accessToken()).then((e) => this.realtime.setAuth(e)).catch((e) => console.warn("Failed to set initial Realtime auth token:", e)), this.rest = new le(new URL("rest/v1", r).href, {
			headers: this.headers,
			schema: o.db.schema,
			fetch: this.fetch,
			timeout: o.db.timeout,
			urlLengthLimit: o.db.urlLengthLimit
		}), this.storage = new vn(this.storageUrl.href, this.headers, this.fetch, n?.storage), o.accessToken || this._listenForAuthEvents();
	}
	get functions() {
		return new c(this.functionsUrl.href, {
			headers: this.headers,
			customFetch: this.fetch
		});
	}
	from(e) {
		return this.rest.from(e);
	}
	schema(e) {
		return this.rest.schema(e);
	}
	rpc(e, t = {}, n = {
		head: !1,
		get: !1,
		count: void 0
	}) {
		return this.rest.rpc(e, t, n);
	}
	channel(e, t = { config: {} }) {
		return this.realtime.channel(e, t);
	}
	getChannels() {
		return this.realtime.getChannels();
	}
	removeChannel(e) {
		return this.realtime.removeChannel(e);
	}
	removeAllChannels() {
		return this.realtime.removeAllChannels();
	}
	async _getAccessToken() {
		var e = this;
		if (e.accessToken) return await e.accessToken();
		let { data: t } = await e.auth.getSession();
		return t.session?.access_token ?? e.supabaseKey;
	}
	_initSupabaseAuthClient({ autoRefreshToken: e, persistSession: t, detectSessionInUrl: n, storage: r, userStorage: i, storageKey: a, flowType: o, lock: s, debug: c, throwOnError: l, experimental: u, lockAcquireTimeout: d, skipAutoInitialize: f }, p, m) {
		let h = {
			Authorization: `Bearer ${this.supabaseKey}`,
			apikey: `${this.supabaseKey}`
		};
		return new Wi({
			url: this.authUrl.href,
			headers: U(U({}, h), p),
			storageKey: a,
			autoRefreshToken: e,
			persistSession: t,
			detectSessionInUrl: n,
			storage: r,
			userStorage: i,
			flowType: o,
			lock: s,
			debug: c,
			throwOnError: l,
			experimental: u,
			fetch: m,
			lockAcquireTimeout: d,
			skipAutoInitialize: f,
			hasCustomAuthorizationHeader: Object.keys(this.headers).some((e) => e.toLowerCase() === "authorization")
		});
	}
	_initRealtimeClient(e) {
		return new bt(this.realtimeUrl.href, U(U({}, e), {}, { params: U(U({}, { apikey: this.supabaseKey }), e?.params) }));
	}
	_listenForAuthEvents() {
		return this.auth.onAuthStateChange((e, t) => {
			this._handleTokenChanged(e, "CLIENT", t?.access_token);
		});
	}
	_handleTokenChanged(e, t, n) {
		(e === "TOKEN_REFRESHED" || e === "SIGNED_IN") && this.changedAccessToken !== n ? (this.changedAccessToken = n, this.realtime.setAuth(n)) : e === "SIGNED_OUT" && (this.realtime.setAuth(), t == "STORAGE" && this.auth.signOut(), this.changedAccessToken = void 0);
	}
}, Ki = (e, t, n) => new Gi(e, t, n);
function qi() {
	if (typeof window < "u") return !1;
	let e = globalThis.process;
	if (!e) return !1;
	let t = e.version;
	if (t == null) return !1;
	let n = t.match(/^v(\d+)\./);
	return n ? parseInt(n[1], 10) <= 20 : !1;
}
qi() && console.warn("⚠️  Node.js 20 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 22 or later. For more information, visit: https://github.com/orgs/supabase/discussions/45715");
//#endregion
//#region ../node_modules/groq-sdk/internal/tslib.mjs
function W(e, t, n, r, i) {
	if (r === "m") throw TypeError("Private method is not writable");
	if (r === "a" && !i) throw TypeError("Private accessor was defined without a setter");
	if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw TypeError("Cannot write private member to an object whose class did not declare it");
	return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function G(e, t, n, r) {
	if (n === "a" && !r) throw TypeError("Private accessor was defined without a getter");
	if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw TypeError("Cannot read private member from an object whose class did not declare it");
	return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/uuid.mjs
var Ji = function() {
	let { crypto: e } = globalThis;
	if (e?.randomUUID) return Ji = e.randomUUID.bind(e), e.randomUUID();
	let t = /* @__PURE__ */ new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (e) => (e ^ n() & 15 >> e / 4).toString(16));
};
//#endregion
//#region ../node_modules/groq-sdk/internal/errors.mjs
function Yi(e) {
	return typeof e == "object" && !!e && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Xi = (e) => {
	if (e instanceof Error) return e;
	if (typeof e == "object" && e) {
		try {
			if (Object.prototype.toString.call(e) === "[object Error]") {
				let t = Error(e.message, e.cause ? { cause: e.cause } : {});
				return e.stack && (t.stack = e.stack), e.cause && !t.cause && (t.cause = e.cause), e.name && (t.name = e.name), t;
			}
		} catch {}
		try {
			return Error(JSON.stringify(e));
		} catch {}
	}
	return Error(e);
}, K = class extends Error {}, q = class e extends K {
	constructor(t, n, r, i) {
		super(`${e.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.error = n;
	}
	static makeMessage(e, t, n) {
		let r = t?.message ? typeof t.message == "string" ? t.message : JSON.stringify(t.message) : t ? JSON.stringify(t) : n;
		return e && r ? `${e} ${r}` : e ? `${e} status code (no body)` : r || "(no status code or body)";
	}
	static generate(t, n, r, i) {
		if (!t || !i) return new Qi({
			message: r,
			cause: Xi(n)
		});
		let a = n;
		return t === 400 ? new ea(t, a, r, i) : t === 401 ? new ta(t, a, r, i) : t === 403 ? new na(t, a, r, i) : t === 404 ? new ra(t, a, r, i) : t === 409 ? new ia(t, a, r, i) : t === 422 ? new aa(t, a, r, i) : t === 429 ? new oa(t, a, r, i) : t >= 500 ? new sa(t, a, r, i) : new e(t, a, r, i);
	}
}, Zi = class extends q {
	constructor({ message: e } = {}) {
		super(void 0, void 0, e || "Request was aborted.", void 0);
	}
}, Qi = class extends q {
	constructor({ message: e, cause: t }) {
		super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
	}
}, $i = class extends Qi {
	constructor({ message: e } = {}) {
		super({ message: e ?? "Request timed out." });
	}
}, ea = class extends q {}, ta = class extends q {}, na = class extends q {}, ra = class extends q {}, ia = class extends q {}, aa = class extends q {}, oa = class extends q {}, sa = class extends q {}, ca = /^[a-z][a-z0-9+.-]*:/i, la = (e) => ca.test(e), ua = (e) => (ua = Array.isArray, ua(e)), da = ua;
function fa(e) {
	if (!e) return !0;
	for (let t in e) return !1;
	return !0;
}
function pa(e, t) {
	return Object.prototype.hasOwnProperty.call(e, t);
}
var ma = (e, t) => {
	if (typeof t != "number" || !Number.isInteger(t)) throw new K(`${e} must be an integer`);
	if (t < 0) throw new K(`${e} must be a positive integer`);
	return t;
}, ha = (e) => {
	try {
		return JSON.parse(e);
	} catch {
		return;
	}
}, ga = (e) => new Promise((t) => setTimeout(t, e)), _a = "1.3.0", va = () => typeof window < "u" && window.document !== void 0 && typeof navigator < "u";
function ya() {
	return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(globalThis.process === void 0 ? 0 : globalThis.process) === "[object process]" ? "node" : "unknown";
}
var ba = () => {
	let e = ya();
	if (e === "deno") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": _a,
		"X-Stainless-OS": Ca(Deno.build.os),
		"X-Stainless-Arch": Sa(Deno.build.arch),
		"X-Stainless-Runtime": "deno",
		"X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
	};
	if (typeof EdgeRuntime < "u") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": _a,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": `other:${EdgeRuntime}`,
		"X-Stainless-Runtime": "edge",
		"X-Stainless-Runtime-Version": globalThis.process.version
	};
	if (e === "node") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": _a,
		"X-Stainless-OS": Ca(globalThis.process.platform ?? "unknown"),
		"X-Stainless-Arch": Sa(globalThis.process.arch ?? "unknown"),
		"X-Stainless-Runtime": "node",
		"X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
	};
	let t = xa();
	return t ? {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": _a,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": `browser:${t.browser}`,
		"X-Stainless-Runtime-Version": t.version
	} : {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": _a,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": "unknown",
		"X-Stainless-Runtime-Version": "unknown"
	};
};
function xa() {
	if (typeof navigator > "u" || !navigator) return null;
	for (let { key: e, pattern: t } of [
		{
			key: "edge",
			pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "ie",
			pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "ie",
			pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "chrome",
			pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "firefox",
			pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
		},
		{
			key: "safari",
			pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
		}
	]) {
		let n = t.exec(navigator.userAgent);
		if (n) return {
			browser: e,
			version: `${n[1] || 0}.${n[2] || 0}.${n[3] || 0}`
		};
	}
	return null;
}
var Sa = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ca = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), wa, Ta = () => wa ??= ba();
//#endregion
//#region ../node_modules/groq-sdk/internal/shims.mjs
function Ea() {
	if (typeof fetch < "u") return fetch;
	throw Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Groq({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Da(...e) {
	let t = globalThis.ReadableStream;
	if (t === void 0) throw Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
	return new t(...e);
}
function Oa(e) {
	let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
	return Da({
		start() {},
		async pull(e) {
			let { done: n, value: r } = await t.next();
			n ? e.close() : e.enqueue(r);
		},
		async cancel() {
			await t.return?.();
		}
	});
}
function ka(e) {
	if (e[Symbol.asyncIterator]) return e;
	let t = e.getReader();
	return {
		async next() {
			try {
				let e = await t.read();
				return e?.done && t.releaseLock(), e;
			} catch (e) {
				throw t.releaseLock(), e;
			}
		},
		async return() {
			let e = t.cancel();
			return t.releaseLock(), await e, {
				done: !0,
				value: void 0
			};
		},
		[Symbol.asyncIterator]() {
			return this;
		}
	};
}
async function Aa(e) {
	if (typeof e != "object" || !e) return;
	if (e[Symbol.asyncIterator]) {
		await e[Symbol.asyncIterator]().return?.();
		return;
	}
	let t = e.getReader(), n = t.cancel();
	t.releaseLock(), await n;
}
//#endregion
//#region ../node_modules/groq-sdk/internal/request-options.mjs
var ja = ({ headers: e, body: t }) => ({
	bodyHeaders: { "content-type": "application/json" },
	body: JSON.stringify(t)
});
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/query.mjs
function Ma(e) {
	return Object.entries(e).filter(([e, t]) => t !== void 0).map(([e, t]) => {
		if (typeof t == "string" || typeof t == "number" || typeof t == "boolean") return `${encodeURIComponent(e)}=${encodeURIComponent(t)}`;
		if (t === null) return `${encodeURIComponent(e)}=`;
		throw new K(`Cannot stringify type ${typeof t}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
	}).join("&");
}
//#endregion
//#region ../node_modules/groq-sdk/internal/uploads.mjs
var Na = () => {
	if (typeof File > "u") {
		let { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
		throw Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
	}
};
function Pa(e, t, n) {
	return Na(), new File(e, t ?? "unknown_file", n);
}
function Fa(e) {
	return (typeof e == "object" && !!e && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Ia = (e) => typeof e == "object" && !!e && typeof e[Symbol.asyncIterator] == "function", La = async (e, t) => ({
	...e,
	body: await Ba(e.body, t)
}), Ra = /* @__PURE__ */ new WeakMap();
function za(e) {
	let t = typeof e == "function" ? e : e.fetch, n = Ra.get(t);
	if (n) return n;
	let r = (async () => {
		try {
			let e = "Response" in t ? t.Response : (await t("data:,")).constructor, n = new FormData();
			return n.toString() !== await new e(n).text();
		} catch {
			return !0;
		}
	})();
	return Ra.set(t, r), r;
}
var Ba = async (e, t) => {
	if (!await za(t)) throw TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
	let n = new FormData();
	return await Promise.all(Object.entries(e || {}).map(([e, t]) => Ha(n, e, t))), n;
}, Va = (e) => e instanceof Blob && "name" in e, Ha = async (e, t, n) => {
	if (n !== void 0) {
		if (n == null) throw TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
		if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
		else if (n instanceof Response) e.append(t, Pa([await n.blob()], Fa(n)));
		else if (Ia(n)) e.append(t, Pa([await new Response(Oa(n)).blob()], Fa(n)));
		else if (Va(n)) e.append(t, n, Fa(n));
		else if (Array.isArray(n)) await Promise.all(n.map((n) => Ha(e, t + "[]", n)));
		else if (typeof n == "object") await Promise.all(Object.entries(n).map(([n, r]) => Ha(e, `${t}[${n}]`, r)));
		else throw TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
	}
}, Ua = (e) => typeof e == "object" && !!e && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Wa = (e) => typeof e == "object" && !!e && typeof e.name == "string" && typeof e.lastModified == "number" && Ua(e), Ga = (e) => typeof e == "object" && !!e && typeof e.url == "string" && typeof e.blob == "function";
async function Ka(e, t, n) {
	if (Na(), e = await e, Wa(e)) return e instanceof File ? e : Pa([await e.arrayBuffer()], e.name);
	if (Ga(e)) {
		let r = await e.blob();
		return t ||= new URL(e.url).pathname.split(/[\\/]/).pop(), Pa(await qa(r), t, n);
	}
	let r = await qa(e);
	if (t ||= Fa(e), !n?.type) {
		let e = r.find((e) => typeof e == "object" && "type" in e && e.type);
		typeof e == "string" && (n = {
			...n,
			type: e
		});
	}
	return Pa(r, t, n);
}
async function qa(e) {
	let t = [];
	if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
	else if (Ua(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
	else if (Ia(e)) for await (let n of e) t.push(...await qa(n));
	else {
		let t = e?.constructor?.name;
		throw Error(`Unexpected data type: ${typeof e}${t ? `; constructor: ${t}` : ""}${Ja(e)}`);
	}
	return t;
}
function Ja(e) {
	return typeof e != "object" || !e ? "" : `; props: [${Object.getOwnPropertyNames(e).map((e) => `"${e}"`).join(", ")}]`;
}
//#endregion
//#region ../node_modules/groq-sdk/core/resource.mjs
var J = class {
	constructor(e) {
		this._client = e;
	}
}, Ya = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Xa(e) {
	if (!e) return;
	if (Ya in e) {
		let { values: t, nulls: n } = e;
		yield* t.entries();
		for (let e of n) yield [e, null];
		return;
	}
	let t = !1, n;
	e instanceof Headers ? n = e.entries() : da(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
	for (let e of n) {
		let n = e[0];
		if (typeof n != "string") throw TypeError("expected header name to be a string");
		let r = da(e[1]) ? e[1] : [e[1]], i = !1;
		for (let e of r) e !== void 0 && (t && !i && (i = !0, yield [n, null]), yield [n, e]);
	}
}
var Za = (e) => {
	let t = new Headers(), n = /* @__PURE__ */ new Set();
	for (let r of e) {
		let e = /* @__PURE__ */ new Set();
		for (let [i, a] of Xa(r)) {
			let r = i.toLowerCase();
			e.has(r) || (t.delete(i), e.add(r)), a === null ? (t.delete(i), n.add(r)) : (t.append(i, a), n.delete(r));
		}
	}
	return {
		[Ya]: !0,
		values: t,
		nulls: n
	};
}, Qa = class extends J {
	create(e, t) {
		return this._client.post("/openai/v1/audio/speech", {
			body: e,
			...t,
			headers: Za([{ Accept: "audio/wav" }, t?.headers]),
			__binaryResponse: !0
		});
	}
}, $a = class extends J {
	create(e, t) {
		return this._client.post("/openai/v1/audio/transcriptions", La({
			body: e,
			...t
		}, this._client));
	}
}, eo = class extends J {
	create(e, t) {
		return this._client.post("/openai/v1/audio/translations", La({
			body: e,
			...t
		}, this._client));
	}
}, to = class extends J {
	constructor() {
		super(...arguments), this.speech = new Qa(this._client), this.transcriptions = new $a(this._client), this.translations = new eo(this._client);
	}
};
to.Speech = Qa, to.Transcriptions = $a, to.Translations = eo;
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/path.mjs
function no(e) {
	return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var ro = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), io = /* @__PURE__ */ ((e = no) => function(t, ...n) {
	if (t.length === 1) return t[0];
	let r = !1, i = [], a = t.reduce((t, a, o) => {
		/[?#]/.test(a) && (r = !0);
		let s = n[o], c = (r ? encodeURIComponent : e)("" + s);
		return o !== n.length && (s == null || typeof s == "object" && s.toString === Object.getPrototypeOf(Object.getPrototypeOf(s.hasOwnProperty ?? ro) ?? ro)?.toString) && (c = s + "", i.push({
			start: t.length + a.length,
			length: c.length,
			error: `Value of type ${Object.prototype.toString.call(s).slice(8, -1)} is not a valid path parameter`
		})), t + a + (o === n.length ? "" : c);
	}, ""), o = a.split(/[?#]/, 1)[0], s = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi, c;
	for (; (c = s.exec(o)) !== null;) i.push({
		start: c.index,
		length: c[0].length,
		error: `Value "${c[0]}" can\'t be safely passed as a path parameter`
	});
	if (i.sort((e, t) => e.start - t.start), i.length > 0) {
		let e = 0, t = i.reduce((t, n) => {
			let r = " ".repeat(n.start - e), i = "^".repeat(n.length);
			return e = n.start + n.length, t + r + i;
		}, "");
		throw new K(`Path parameters result in path with invalid segments:\n${i.map((e) => e.error).join("\n")}\n${a}\n${t}`);
	}
	return a;
})(no), ao = class extends J {
	create(e, t) {
		return this._client.post("/openai/v1/batches", {
			body: e,
			...t
		});
	}
	retrieve(e, t) {
		return this._client.get(io`/openai/v1/batches/${e}`, t);
	}
	list(e) {
		return this._client.get("/openai/v1/batches", e);
	}
	cancel(e, t) {
		return this._client.post(io`/openai/v1/batches/${e}/cancel`, t);
	}
}, oo = class extends J {
	create(e, t) {
		return this._client.post("/openai/v1/chat/completions", {
			body: e,
			...t,
			stream: e.stream ?? !1
		});
	}
}, so = class extends J {
	constructor() {
		super(...arguments), this.completions = new oo(this._client);
	}
};
so.Completions = oo;
//#endregion
//#region ../node_modules/groq-sdk/resources/completions.mjs
var co = class extends J {}, lo = class extends J {
	create(e, t) {
		return this._client.post("/openai/v1/embeddings", {
			body: e,
			...t
		});
	}
}, uo = class extends J {
	create(e, t) {
		return this._client.post("/openai/v1/files", La({
			body: e,
			...t
		}, this._client));
	}
	list(e) {
		return this._client.get("/openai/v1/files", e);
	}
	delete(e, t) {
		return this._client.delete(io`/openai/v1/files/${e}`, t);
	}
	content(e, t) {
		return this._client.get(io`/openai/v1/files/${e}/content`, {
			...t,
			headers: Za([{ Accept: "application/octet-stream" }, t?.headers]),
			__binaryResponse: !0
		});
	}
	info(e, t) {
		return this._client.get(io`/openai/v1/files/${e}`, t);
	}
}, fo = class extends J {
	retrieve(e, t) {
		return this._client.get(io`/openai/v1/models/${e}`, t);
	}
	list(e) {
		return this._client.get("/openai/v1/models", e);
	}
	delete(e, t) {
		return this._client.delete(io`/openai/v1/models/${e}`, t);
	}
};
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/bytes.mjs
function po(e) {
	let t = 0;
	for (let n of e) t += n.length;
	let n = new Uint8Array(t), r = 0;
	for (let t of e) n.set(t, r), r += t.length;
	return n;
}
var mo;
function ho(e) {
	let t;
	return (mo ??= (t = new globalThis.TextEncoder(), t.encode.bind(t)))(e);
}
var go;
function _o(e) {
	let t;
	return (go ??= (t = new globalThis.TextDecoder(), t.decode.bind(t)))(e);
}
//#endregion
//#region ../node_modules/groq-sdk/internal/decoders/line.mjs
var Y, X, vo = class {
	constructor() {
		Y.set(this, void 0), X.set(this, void 0), W(this, Y, /* @__PURE__ */ new Uint8Array(), "f"), W(this, X, null, "f");
	}
	decode(e) {
		if (e == null) return [];
		let t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ho(e) : e;
		W(this, Y, po([G(this, Y, "f"), t]), "f");
		let n = [], r;
		for (; (r = yo(G(this, Y, "f"), G(this, X, "f"))) != null;) {
			if (r.carriage && G(this, X, "f") == null) {
				W(this, X, r.index, "f");
				continue;
			}
			if (G(this, X, "f") != null && (r.index !== G(this, X, "f") + 1 || r.carriage)) {
				n.push(_o(G(this, Y, "f").subarray(0, G(this, X, "f") - 1))), W(this, Y, G(this, Y, "f").subarray(G(this, X, "f")), "f"), W(this, X, null, "f");
				continue;
			}
			let e = G(this, X, "f") === null ? r.preceding : r.preceding - 1, t = _o(G(this, Y, "f").subarray(0, e));
			n.push(t), W(this, Y, G(this, Y, "f").subarray(r.index), "f"), W(this, X, null, "f");
		}
		return n;
	}
	flush() {
		return G(this, Y, "f").length ? this.decode("\n") : [];
	}
};
Y = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakMap(), vo.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]), vo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function yo(e, t) {
	for (let n = t ?? 0; n < e.length; n++) {
		if (e[n] === 10) return {
			preceding: n,
			index: n + 1,
			carriage: !1
		};
		if (e[n] === 13) return {
			preceding: n,
			index: n + 1,
			carriage: !0
		};
	}
	return null;
}
function bo(e) {
	for (let t = 0; t < e.length - 1; t++) {
		if (e[t] === 10 && e[t + 1] === 10 || e[t] === 13 && e[t + 1] === 13) return t + 2;
		if (e[t] === 13 && e[t + 1] === 10 && t + 3 < e.length && e[t + 2] === 13 && e[t + 3] === 10) return t + 4;
	}
	return -1;
}
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/log.mjs
var xo = {
	off: 0,
	error: 200,
	warn: 300,
	info: 400,
	debug: 500
}, So = (e, t, n) => {
	if (e) {
		if (pa(xo, e)) return e;
		Z(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(xo))}`);
	}
};
function Co() {}
function wo(e, t, n) {
	return !t || xo[e] > xo[n] ? Co : t[e].bind(t);
}
var To = {
	error: Co,
	warn: Co,
	info: Co,
	debug: Co
}, Eo = /* @__PURE__ */ new WeakMap();
function Z(e) {
	let t = e.logger, n = e.logLevel ?? "off";
	if (!t) return To;
	let r = Eo.get(t);
	if (r && r[0] === n) return r[1];
	let i = {
		error: wo("error", t, n),
		warn: wo("warn", t, n),
		info: wo("info", t, n),
		debug: wo("debug", t, n)
	};
	return Eo.set(t, [n, i]), i;
}
var Do = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers &&= Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([e, t]) => [e, e.toLowerCase() === "authorization" || e.toLowerCase() === "api-key" || e.toLowerCase() === "x-api-key" || e.toLowerCase() === "cookie" || e.toLowerCase() === "set-cookie" ? "***" : t])), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Oo, ko = class e {
	constructor(e, t, n) {
		this.iterator = e, Oo.set(this, void 0), this.controller = t, W(this, Oo, n, "f");
	}
	static fromSSEResponse(t, n, r) {
		let i = !1, a = r ? Z(r) : console;
		async function* o() {
			if (i) throw new K("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			i = !0;
			let e = !1;
			try {
				for await (let r of Ao(t, n)) if (!e) {
					if (r.data.startsWith("[DONE]")) {
						e = !0;
						continue;
					}
					if (r.event === null || !r.event.startsWith("thread.")) {
						let e;
						try {
							e = JSON.parse(r.data);
						} catch (e) {
							throw a.error("Could not parse message into JSON:", r.data), a.error("From chunk:", r.raw), e;
						}
						if (e && e.error) throw new q(void 0, e.error, void 0, t.headers);
						yield e;
					} else {
						let e;
						try {
							e = JSON.parse(r.data);
						} catch (e) {
							throw console.error("Could not parse message into JSON:", r.data), console.error("From chunk:", r.raw), e;
						}
						if (r.event == "error") throw new q(void 0, e.error, e.message, void 0);
						yield {
							event: r.event,
							data: e
						};
					}
				}
				e = !0;
			} catch (e) {
				if (Yi(e)) return;
				throw e;
			} finally {
				e || n.abort();
			}
		}
		return new e(o, n, r);
	}
	static fromReadableStream(t, n, r) {
		let i = !1;
		async function* a() {
			let e = new vo(), n = ka(t);
			for await (let t of n) for (let n of e.decode(t)) yield n;
			for (let t of e.flush()) yield t;
		}
		async function* o() {
			if (i) throw new K("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			i = !0;
			let e = !1;
			try {
				for await (let t of a()) e || t && (yield JSON.parse(t));
				e = !0;
			} catch (e) {
				if (Yi(e)) return;
				throw e;
			} finally {
				e || n.abort();
			}
		}
		return new e(o, n, r);
	}
	[(Oo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
		return this.iterator();
	}
	tee() {
		let t = [], n = [], r = this.iterator(), i = (e) => ({ next: () => {
			if (e.length === 0) {
				let e = r.next();
				t.push(e), n.push(e);
			}
			return e.shift();
		} });
		return [new e(() => i(t), this.controller, G(this, Oo, "f")), new e(() => i(n), this.controller, G(this, Oo, "f"))];
	}
	toReadableStream() {
		let e = this, t;
		return Da({
			async start() {
				t = e[Symbol.asyncIterator]();
			},
			async pull(e) {
				try {
					let { value: n, done: r } = await t.next();
					if (r) return e.close();
					let i = ho(JSON.stringify(n) + "\n");
					e.enqueue(i);
				} catch (t) {
					e.error(t);
				}
			},
			async cancel() {
				await t.return?.();
			}
		});
	}
};
async function* Ao(e, t) {
	if (!e.body) throw t.abort(), globalThis.navigator !== void 0 && globalThis.navigator.product === "ReactNative" ? new K("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new K("Attempted to iterate over a response with no body");
	let n = new Mo(), r = new vo(), i = ka(e.body);
	for await (let e of jo(i)) for (let t of r.decode(e)) {
		let e = n.decode(t);
		e && (yield e);
	}
	for (let e of r.flush()) {
		let t = n.decode(e);
		t && (yield t);
	}
}
async function* jo(e) {
	let t = /* @__PURE__ */ new Uint8Array();
	for await (let n of e) {
		if (n == null) continue;
		let e = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ho(n) : n, r = new Uint8Array(t.length + e.length);
		r.set(t), r.set(e, t.length), t = r;
		let i;
		for (; (i = bo(t)) !== -1;) yield t.slice(0, i), t = t.slice(i);
	}
	t.length > 0 && (yield t);
}
var Mo = class {
	constructor() {
		this.event = null, this.data = [], this.chunks = [];
	}
	decode(e) {
		if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
			if (!this.event && !this.data.length) return null;
			let e = {
				event: this.event,
				data: this.data.join("\n"),
				raw: this.chunks
			};
			return this.event = null, this.data = [], this.chunks = [], e;
		}
		if (this.chunks.push(e), e.startsWith(":")) return null;
		let [t, n, r] = No(e, ":");
		return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
	}
};
function No(e, t) {
	let n = e.indexOf(t);
	return n === -1 ? [
		e,
		"",
		""
	] : [
		e.substring(0, n),
		t,
		e.substring(n + t.length)
	];
}
//#endregion
//#region ../node_modules/groq-sdk/internal/parse.mjs
async function Po(e, t) {
	let { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: a } = t, o = await (async () => {
		if (n.status === 204) return null;
		if (t.options.__binaryResponse) return n;
		if (t.options.stream) return ko.fromSSEResponse(n, t.controller, e);
		let r = n.headers.get("content-type")?.split(";")[0]?.trim();
		return r?.includes("application/json") || r?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
	})();
	return Z(e).debug(`[${r}] response parsed`, Do({
		retryOfRequestLogID: i,
		url: n.url,
		status: n.status,
		body: o,
		durationMs: Date.now() - a
	})), o;
}
//#endregion
//#region ../node_modules/groq-sdk/core/api-promise.mjs
var Fo, Io = class e extends Promise {
	constructor(e, t, n = Po) {
		super((e) => {
			e(null);
		}), this.responsePromise = t, this.parseResponse = n, Fo.set(this, void 0), W(this, Fo, e, "f");
	}
	_thenUnwrap(t) {
		return new e(G(this, Fo, "f"), this.responsePromise, async (e, n) => t(await this.parseResponse(e, n), n));
	}
	asResponse() {
		return this.responsePromise.then((e) => e.response);
	}
	async withResponse() {
		let [e, t] = await Promise.all([this.parse(), this.asResponse()]);
		return {
			data: e,
			response: t
		};
	}
	parse() {
		return this.parsedPromise ||= this.responsePromise.then((e) => this.parseResponse(G(this, Fo, "f"), e)), this.parsedPromise;
	}
	then(e, t) {
		return this.parse().then(e, t);
	}
	catch(e) {
		return this.parse().catch(e);
	}
	finally(e) {
		return this.parse().finally(e);
	}
};
Fo = /* @__PURE__ */ new WeakMap();
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/env.mjs
var Lo = (e) => {
	if (globalThis.process !== void 0) return globalThis.process.env?.[e]?.trim() || void 0;
	if (globalThis.Deno !== void 0) return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ro, zo, Bo, Vo, Q = class {
	constructor({ baseURL: e = Lo("GROQ_BASE_URL"), apiKey: t = Lo("GROQ_API_KEY"), ...n } = {}) {
		if (Ro.add(this), Bo.set(this, void 0), this.completions = new co(this), this.chat = new so(this), this.embeddings = new lo(this), this.audio = new to(this), this.models = new fo(this), this.batches = new ao(this), this.files = new uo(this), t === void 0) throw new K("The GROQ_API_KEY environment variable is missing or empty; either provide it, or instantiate the Groq client with an apiKey option, like new Groq({ apiKey: 'My API Key' }).");
		let r = {
			apiKey: t,
			...n,
			baseURL: e || "https://api.groq.com"
		};
		if (!r.dangerouslyAllowBrowser && va()) throw new K("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Groq({ apiKey, dangerouslyAllowBrowser: true })");
		this.baseURL = r.baseURL, this.timeout = r.timeout ?? zo.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
		let i = "warn";
		this.logLevel = i, this.logLevel = So(r.logLevel, "ClientOptions.logLevel", this) ?? So(Lo("GROQ_LOG"), "process.env['GROQ_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? Ea(), W(this, Bo, ja, "f");
		let a = Lo("GROQ_CUSTOM_HEADERS");
		if (a) {
			let e = {};
			for (let t of a.split("\n")) {
				let n = t.indexOf(":");
				n >= 0 && (e[t.substring(0, n).trim()] = t.substring(n + 1).trim());
			}
			r.defaultHeaders = {
				...e,
				...r.defaultHeaders
			};
		}
		this._options = r, this.apiKey = t;
	}
	withOptions(e) {
		return new this.constructor({
			...this._options,
			baseURL: this.baseURL,
			maxRetries: this.maxRetries,
			timeout: this.timeout,
			logger: this.logger,
			logLevel: this.logLevel,
			fetch: this.fetch,
			fetchOptions: this.fetchOptions,
			apiKey: this.apiKey,
			...e
		});
	}
	defaultQuery() {
		return this._options.defaultQuery;
	}
	validateHeaders({ values: e, nulls: t }) {}
	async authHeaders(e) {
		return Za([{ Authorization: `Bearer ${this.apiKey}` }]);
	}
	stringifyQuery(e) {
		return Ma(e);
	}
	getUserAgent() {
		return `${this.constructor.name}/JS ${_a}`;
	}
	defaultIdempotencyKey() {
		return `stainless-node-retry-${Ji()}`;
	}
	makeStatusError(e, t, n, r) {
		return q.generate(e, t, n, r);
	}
	buildURL(e, t, n) {
		let r = !G(this, Ro, "m", Vo).call(this) && n || this.baseURL, i = la(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), a = this.defaultQuery(), o = Object.fromEntries(i.searchParams);
		return (!fa(a) || !fa(o)) && (t = {
			...o,
			...a,
			...t
		}), typeof t == "object" && t && !Array.isArray(t) && (i.search = this.stringifyQuery(t)), i.toString();
	}
	async prepareOptions(e) {}
	async prepareRequest(e, { url: t, options: n }) {}
	get(e, t) {
		return this.methodRequest("get", e, t);
	}
	post(e, t) {
		return this.methodRequest("post", e, t);
	}
	patch(e, t) {
		return this.methodRequest("patch", e, t);
	}
	put(e, t) {
		return this.methodRequest("put", e, t);
	}
	delete(e, t) {
		return this.methodRequest("delete", e, t);
	}
	methodRequest(e, t, n) {
		return this.request(Promise.resolve(n).then((n) => ({
			method: e,
			path: t,
			...n
		})));
	}
	request(e, t = null) {
		return new Io(this, this.makeRequest(e, t, void 0));
	}
	async makeRequest(e, t, n) {
		let r = await e, i = r.maxRetries ?? this.maxRetries;
		t ??= i, await this.prepareOptions(r);
		let { req: a, url: o, timeout: s } = await this.buildRequest(r, { retryCount: i - t });
		await this.prepareRequest(a, {
			url: o,
			options: r
		});
		let c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), l = n === void 0 ? "" : `, retryOf: ${n}`, u = Date.now();
		if (Z(this).debug(`[${c}] sending request`, Do({
			retryOfRequestLogID: n,
			method: r.method,
			url: o,
			options: r,
			headers: a.headers
		})), r.signal?.aborted) throw new Zi();
		let d = new AbortController(), f = await this.fetchWithTimeout(o, a, s, d).catch(Xi), p = Date.now();
		if (f instanceof globalThis.Error) {
			let e = `retrying, ${t} attempts remaining`;
			if (r.signal?.aborted) throw new Zi();
			let i = Yi(f) || /timed? ?out/i.test(String(f) + ("cause" in f ? String(f.cause) : ""));
			if (t) return Z(this).info(`[${c}] connection ${i ? "timed out" : "failed"} - ${e}`), Z(this).debug(`[${c}] connection ${i ? "timed out" : "failed"} (${e})`, Do({
				retryOfRequestLogID: n,
				url: o,
				durationMs: p - u,
				message: f.message
			})), this.retryRequest(r, t, n ?? c);
			throw Z(this).info(`[${c}] connection ${i ? "timed out" : "failed"} - error; no more retries left`), Z(this).debug(`[${c}] connection ${i ? "timed out" : "failed"} (error; no more retries left)`, Do({
				retryOfRequestLogID: n,
				url: o,
				durationMs: p - u,
				message: f.message
			})), i ? new $i() : new Qi({ cause: f });
		}
		let m = `[${c}${l}] ${a.method} ${o} ${f.ok ? "succeeded" : "failed"} with status ${f.status} in ${p - u}ms`;
		if (!f.ok) {
			let e = await this.shouldRetry(f);
			if (t && e) {
				let e = `retrying, ${t} attempts remaining`;
				return await Aa(f.body), Z(this).info(`${m} - ${e}`), Z(this).debug(`[${c}] response error (${e})`, Do({
					retryOfRequestLogID: n,
					url: f.url,
					status: f.status,
					headers: f.headers,
					durationMs: p - u
				})), this.retryRequest(r, t, n ?? c, f.headers);
			}
			let i = e ? "error; no more retries left" : "error; not retryable";
			Z(this).info(`${m} - ${i}`);
			let a = await f.text().catch((e) => Xi(e).message), o = ha(a), s = o ? void 0 : a;
			throw Z(this).debug(`[${c}] response error (${i})`, Do({
				retryOfRequestLogID: n,
				url: f.url,
				status: f.status,
				headers: f.headers,
				message: s,
				durationMs: Date.now() - u
			})), this.makeStatusError(f.status, o, s, f.headers);
		}
		return Z(this).info(m), Z(this).debug(`[${c}] response start`, Do({
			retryOfRequestLogID: n,
			url: f.url,
			status: f.status,
			headers: f.headers,
			durationMs: p - u
		})), {
			response: f,
			options: r,
			controller: d,
			requestLogID: c,
			retryOfRequestLogID: n,
			startTime: u
		};
	}
	async fetchWithTimeout(e, t, n, r) {
		let { signal: i, method: a, ...o } = t || {}, s = this._makeAbort(r);
		i && i.addEventListener("abort", s, { once: !0 });
		let c = setTimeout(s, n), l = globalThis.ReadableStream && o.body instanceof globalThis.ReadableStream || typeof o.body == "object" && o.body !== null && Symbol.asyncIterator in o.body, u = {
			signal: r.signal,
			...l ? { duplex: "half" } : {},
			method: "GET",
			...o
		};
		a && (u.method = a.toUpperCase());
		try {
			return await this.fetch.call(void 0, e, u);
		} finally {
			clearTimeout(c);
		}
	}
	async shouldRetry(e) {
		let t = e.headers.get("x-should-retry");
		return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
	}
	async retryRequest(e, t, n, r) {
		let i, a = r?.get("retry-after-ms");
		if (a) {
			let e = parseFloat(a);
			Number.isNaN(e) || (i = e);
		}
		let o = r?.get("retry-after");
		if (o && !i) {
			let e = parseFloat(o);
			i = Number.isNaN(e) ? Date.parse(o) - Date.now() : e * 1e3;
		}
		if (i === void 0) {
			let n = e.maxRetries ?? this.maxRetries;
			i = this.calculateDefaultRetryTimeoutMillis(t, n);
		}
		return await ga(i), this.makeRequest(e, t - 1, n);
	}
	calculateDefaultRetryTimeoutMillis(e, t) {
		let n = t - e;
		return Math.min(.5 * 2 ** n, 8) * (1 - Math.random() * .25) * 1e3;
	}
	async buildRequest(e, { retryCount: t = 0 } = {}) {
		let n = { ...e }, { method: r, path: i, query: a, defaultBaseURL: o } = n, s = this.buildURL(i, a, o);
		"timeout" in n && ma("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
		let { bodyHeaders: c, body: l } = this.buildBody({ options: n });
		return {
			req: {
				method: r,
				headers: await this.buildHeaders({
					options: e,
					method: r,
					bodyHeaders: c,
					retryCount: t
				}),
				...n.signal && { signal: n.signal },
				...globalThis.ReadableStream && l instanceof globalThis.ReadableStream && { duplex: "half" },
				...l && { body: l },
				...this.fetchOptions ?? {},
				...n.fetchOptions ?? {}
			},
			url: s,
			timeout: n.timeout
		};
	}
	async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: r }) {
		let i = {};
		this.idempotencyHeader && t !== "get" && (e.idempotencyKey ||= this.defaultIdempotencyKey(), i[this.idempotencyHeader] = e.idempotencyKey);
		let a = Za([
			i,
			{
				Accept: "application/json",
				"User-Agent": this.getUserAgent(),
				"X-Stainless-Retry-Count": String(r),
				...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
				...Ta()
			},
			await this.authHeaders(e),
			this._options.defaultHeaders,
			n,
			e.headers
		]);
		return this.validateHeaders(a), a.values;
	}
	_makeAbort(e) {
		return () => e.abort();
	}
	buildBody({ options: e }) {
		let { body: t, headers: n } = e;
		if (!t) return t == null && "body" in e ? G(this, Bo, "f").call(this, {
			body: t,
			headers: Za([n])
		}) : {
			bodyHeaders: void 0,
			body: void 0
		};
		let r = Za([n]);
		return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
			bodyHeaders: void 0,
			body: t
		} : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
			bodyHeaders: void 0,
			body: Oa(t)
		} : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
			bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
			body: this.stringifyQuery(t)
		} : G(this, Bo, "f").call(this, {
			body: t,
			headers: r
		});
	}
};
zo = Q, Bo = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakSet(), Vo = function() {
	return this.baseURL !== "https://api.groq.com";
}, Q.Groq = zo, Q.DEFAULT_TIMEOUT = 6e4, Q.GroqError = K, Q.APIError = q, Q.APIConnectionError = Qi, Q.APIConnectionTimeoutError = $i, Q.APIUserAbortError = Zi, Q.NotFoundError = ra, Q.ConflictError = ia, Q.RateLimitError = oa, Q.BadRequestError = ea, Q.AuthenticationError = ta, Q.InternalServerError = sa, Q.PermissionDeniedError = na, Q.UnprocessableEntityError = aa, Q.toFile = Ka, Q.Completions = co, Q.Chat = so, Q.Embeddings = lo, Q.Audio = to, Q.Models = fo, Q.Batches = ao, Q.Files = uo;
//#endregion
//#region ../shared/prompts/defaultPrompt.js
var Ho = "You are an expert open-source repository maintainer, systems architect, and technical analyst. Your sole responsibility is to analyze an incoming GitHub issue, extract its core technical context, and cross-reference it against existing historical context to identify duplicate or overlapping submissions.\n\nINCOMING ISSUE DATA\nThe incoming issue will belong to one of several templates (e.g., Bug, Feature, Security, Performance, Refactor, UI/UX, Docs, Test, Good First Issue). The following fields have been parsed from the submission (fields not applicable to this specific issue type will remain empty):\n\n1. Core Problem / Request:\n{{issue.primary_description}}\n\n2. Context & Reproduction:\n{{issue.context_steps}}\n\n3. Proposed Solution / Impact:\n{{issue.expected_outcome}}\n\n4. Technical Metrics & Environment:\n{{issue.technical_metrics}}\n\nHISTORICAL REPOSITORY CONTEXT\nThe following is an array of existing active or resolved issue IDs along with their previously computed summaries to check against for duplicates:\n{{repository.historical_context_log}}\n\nANALYSIS GUIDELINES\n- Determine the Scope:\n  - Bugs & Security: Isolate root causes (e.g., stack traces, bottlenecks, vulnerabilities).\n  - Features & UI: Analyze the architectural impact, DOM manipulations, or accessibility concerns.\n  - Performance & Refactor: Evaluate the proposed system modifications against current benchmarks.\n- Handle Incomplete Templates: Rely strictly on the fields provided. Do not invent missing facts or infer technical metrics if the user omitted them.\n- Trace Structural Links: Classify an issue as a duplicate ONLY if it targets the exact same code-path break, UI component failure, or architectural enhancement as a historical issue.\n\nOUTPUT COMPLIANCE CONTRACT\nYou MUST respond using a single, valid JSON object.\nDo NOT wrap the JSON inside markdown code blocks (such as ```json ... ```).\nDo NOT include any conversational introduction, sign-offs, or explanatory prose outside of the JSON keys.\nEnsure all quotes inside text strings are properly escaped to prevent parsing failures.\n\nYour response must strictly conform to the following schema structure:\n{\n  \"is_duplicate\": true,\n  \"analysis_summary\": \"Provide a thorough technical breakdown explaining why this issue is structurally linked to an existing issue, or if unique, a crisp summary of its core scope.\"\n}\n";
//#endregion
//#region ../shared/utils/renderPrompt.js
function Uo(e, t) {
	return e.replace(/\{\{([^}]+)\}\}/g, (e, n) => {
		let r = n.trim().split("."), i = t;
		for (let e of r) {
			if (typeof i != "object" || !i) return "";
			i = i[e];
		}
		return i == null ? "" : String(i);
	});
}
function Wo(e, t) {
	return {
		issue: {
			title: e.title ?? "",
			primary_description: e.primary_description ?? "",
			context_steps: e.context_steps ?? "",
			expected_outcome: e.expected_outcome ?? "",
			technical_metrics: e.technical_metrics ?? ""
		},
		repository: { historical_context_log: t ?? "" }
	};
}
//#endregion
//#region src/lib/supabase.js
var Go = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {}
}, Ko = "repoOwlConfig", qo = null;
async function Jo() {
	let e = {};
	return typeof chrome < "u" && chrome.storage?.local && (e = (await chrome.storage.local.get([Ko]))[Ko] || {}), e.supabaseUrl ||= "https://sdgazpgnenkammrlhjel.supabase.co", e.supabaseAnonKey ||= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", e;
}
async function Yo() {
	let e = await Jo();
	return !!(e.supabaseUrl && e.supabaseAnonKey);
}
async function $() {
	if (!await Yo()) return null;
	if (!qo) {
		let e = await Jo();
		qo = Ki(e.supabaseUrl, e.supabaseAnonKey, { auth: {
			persistSession: !1,
			autoRefreshToken: !1,
			detectSessionInUrl: !1,
			storage: Go
		} });
	}
	return qo;
}
async function Xo() {
	let e = await $();
	if (!e) return { error: "Sandbox Supabase is not configured for RepoOwl." };
	try {
		let { data: t, error: n } = await e.auth.getSession();
		if (n) throw Error(n.message);
		if (t.session) return { error: null };
		let { error: r } = await e.auth.signInAnonymously();
		if (r) throw Error(r.message);
		return { error: null };
	} catch (e) {
		return { error: e.message ?? "Failed to establish an authenticated RepoOwl session. Enable Anonymous sign-ins in Supabase Auth." };
	}
}
//#endregion
//#region src/prTriage.js
async function Zo(e, t) {
	let [n, r] = e.split("/");
	if (!n || !r) throw Error(`Invalid repository: ${e}`);
	let i = new URL(`https://api.github.com/repos/${n}/${r}/pulls`);
	i.searchParams.set("state", "open"), i.searchParams.set("per_page", "100"), i.searchParams.set("direction", "asc");
	let a = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28"
	};
	t && (a.Authorization = `Bearer ${t}`);
	let o = await fetch(i.toString(), { headers: a });
	if (!o.ok) {
		let e = await o.text();
		throw Error(`GitHub API error (${o.status}): ${e}`);
	}
	return o.json();
}
async function Qo(e, t, n) {
	let [r, i] = e.split("/"), a = new URL(`https://api.github.com/repos/${r}/${i}/pulls/${t}/files`);
	a.searchParams.set("per_page", "100");
	let o = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28"
	};
	n && (o.Authorization = `Bearer ${n}`);
	let s = await fetch(a.toString(), { headers: o });
	if (!s.ok) throw Error(`GitHub API error (${s.status}) fetching diffs`);
	return (await s.json()).filter((e) => e.status !== "removed" && !e.filename.endsWith(".lock") && !e.filename.endsWith(".svg") && !e.filename.endsWith(".png") && !e.filename.endsWith(".min.js") && e.patch);
}
async function $o(e, t, n, r) {
	if (!n || n.length === 0) return;
	let [i, a] = e.split("/"), o = `https://api.github.com/repos/${i}/${a}/issues/${t}/labels`, s = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		"Content-Type": "application/json"
	};
	r && (s.Authorization = `Bearer ${r}`), await fetch(o, {
		method: "POST",
		headers: s,
		body: JSON.stringify({ labels: n })
	});
}
var es = (e) => new Promise((t) => setTimeout(t, e));
async function ts(e, t, n = 3) {
	for (let r = 0; r < n; r++) try {
		return await e.chat.completions.create(t);
	} catch (e) {
		if (e.status === 429 && r < n - 1) {
			let t = 6e3, n = e.message?.match(/Please try again in ([\d.]+)s/);
			n && (t = Math.ceil(parseFloat(n[1]) * 1e3) + 500), console.warn(`Rate limit hit. Waiting ${t}ms before retry...`), await es(t);
		} else throw e;
	}
}
async function ns(e, t, n) {
	let r = await Qo(e, t.number, n.githubToken), i = new Q({
		apiKey: n.groqApiKey,
		dangerouslyAllowBrowser: !0
	}), a = [];
	for (let e of r) {
		let t = `Summarize what this file diff does in 2 sentences max.\nFile: ${e.filename}\nDiff:\n${e.patch}`;
		try {
			let n = (await ts(i, {
				messages: [{
					role: "user",
					content: t
				}],
				model: "llama-3.3-70b-versatile",
				temperature: .1
			})).choices[0]?.message?.content?.trim();
			a.push(`${e.filename}: ${n}`), await es(1e3);
		} catch (t) {
			console.warn(`Failed to map file ${e.filename}`, t);
		}
	}
	let o = "No linked issue context available.", s = t.body?.match(/(?:fixes|resolves|closes)\s+#(\d+)/i);
	if (s) {
		let t = parseInt(s[1]), { data: n } = await (await $()).from("issues").select("analysis_summary").eq("repo_name", e).eq("issue_number", t).single();
		n && n.analysis_summary && (o = `Linked Issue #${t} Goal: ${n.analysis_summary}`);
	}
	let c = (await ts(i, {
		messages: [{
			role: "user",
			content: `You are a strict PR reviewer.
PR Description: ${t.body || "None"}
Linked Issue Context: ${o}

Code File Summaries:
${a.join("\n\n")}

Analyze the PR based on the above.
Respond STRICTLY with this JSON schema:
{
  "slop_detection": {
    "is_accurate": boolean,
    "confidence_score": number,
    "warning": "string"
  },
  "issue_resolution": {
    "solves_linked_issue": boolean,
    "explanation": "string"
  },
  "domain_impact": [
    { "domain": "string", "percentage": number, "files": ["string"] }
  ],
  "recommended_labels": ["string"]
}`
		}],
		model: "llama-3.3-70b-versatile",
		temperature: .1,
		response_format: { type: "json_object" }
	})).choices[0]?.message?.content?.trim(), l = JSON.parse(c), { error: u } = await (await $()).from("pull_requests").upsert({
		repo_name: e,
		pr_number: t.number,
		slop_detection: l.slop_detection,
		issue_resolution: l.issue_resolution,
		domain_impact: l.domain_impact,
		recommended_labels: l.recommended_labels
	});
	if (u && console.error("Error saving PR analysis", u), l.recommended_labels?.length > 0) try {
		await $o(e, t.number, l.recommended_labels, n.githubToken);
	} catch (e) {
		console.warn("Failed to auto-label PR", e);
	}
	return l;
}
//#endregion
//#region src/background.js
var rs = 2e3, is = (e) => new Promise((t) => setTimeout(t, e));
chrome.runtime.onMessage.addListener((e, t, n) => {
	if (e.action === "open_settings") chrome.runtime.openOptionsPage();
	else if (e.action === "force_sync_issues") return bs([e.repoName]).then(() => n({ success: !0 })).catch((e) => n({ error: e.message })), !0;
	else if (e.action === "force_sync_prs") return xs([e.repoName]).then(() => n({ success: !0 })).catch((e) => n({ error: e.message })), !0;
	else if (e.action === "add_repo") as(e.repoName).catch((e) => console.error("Error auto-publishing config:", e)), n({ success: !0 });
	else if (e.action === "check_mediator_status") return cs(e.repoName).then((e) => n(e)).catch((e) => n({ error: e.message })), !0;
});
async function as(e) {
	let t = (await chrome.storage.local.get(["repoOwlConfig"])).repoOwlConfig || {};
	if (!(!t.githubToken || !t.supabaseUrl || !t.supabaseAnonKey)) try {
		let n = await fetch(`https://api.github.com/repos/${e}`, { headers: {
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			Authorization: `Bearer ${t.githubToken}`
		} });
		if (!n.ok) return;
		let r = await n.json();
		(r.permissions?.push === !0 || r.permissions?.admin === !0) && (await os(e, t), await ss(e, t));
	} catch (t) {
		console.error(`[${e}] Error verifying permissions for auto-publish:`, t);
	}
}
async function os(e, t) {
	let n = {
		supabaseUrl: t.supabaseUrl,
		supabaseAnonKey: t.supabaseAnonKey
	}, r = btoa(JSON.stringify(n, null, 2)), i;
	try {
		let n = await fetch(`https://api.github.com/repos/${e}/contents/repoowl.json?ref=main`, { headers: {
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			Authorization: `Bearer ${t.githubToken}`
		} });
		n.ok && (i = (await n.json()).sha);
	} catch (e) {
		console.warn("Could not fetch existing repoowl.json sha", e);
	}
	await fetch(`https://api.github.com/repos/${e}/contents/repoowl.json`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${t.githubToken}`,
			"Content-Type": "application/json",
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28"
		},
		body: JSON.stringify({
			message: "chore(repoowl): auto-publish public hub configuration",
			content: r,
			branch: "main",
			...i && { sha: i }
		})
	});
}
async function ss(e, t, n = console.log) {
	let [r, i] = e.split("/"), a = Ki("https://sdgazpgnenkammrlhjel.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", { auth: { persistSession: !1 } });
	try {
		let { data: o, error: s } = await a.functions.invoke("registry", { body: {
			owner: r,
			repo: i,
			supabaseUrl: t.supabaseUrl,
			supabaseAnonKey: t.supabaseAnonKey,
			githubToken: t.githubToken
		} });
		n(s ? `[${e}] Error registering with Mediator: ${s.message || JSON.stringify(s)}` : `[${e}] Successfully registered keys with Central Mediator.`);
	} catch (t) {
		n(`[${e}] Mediator registration exception: ${t.message}`);
	}
}
async function cs(e) {
	let [t, n] = e.split("/");
	try {
		let { data: e, error: r } = await Ki("https://sdgazpgnenkammrlhjel.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", { auth: { persistSession: !1 } }).from("registry").select("created_at").eq("owner", t).eq("repo", n).single();
		return !r && e ? {
			registered: !0,
			createdAt: e.created_at
		} : { registered: !1 };
	} catch (e) {
		return {
			registered: !1,
			error: e.message
		};
	}
}
chrome.runtime.onInstalled.addListener(() => {
	chrome.alarms.create("repoOwlHourlySync", { periodInMinutes: 60 });
}), chrome.alarms.onAlarm.addListener(async (e) => {
	e.name === "repoOwlHourlySync" && (console.log("Waking up for hourly sync..."), await executeSyncQueue());
});
async function ls(e, t) {
	let [n, r] = e.split("/");
	if (!n || !r) throw Error(`Invalid repository: ${e}`);
	let i = new URL(`https://api.github.com/repos/${n}/${r}/issues`);
	i.searchParams.set("state", "open"), i.searchParams.set("per_page", "100"), i.searchParams.set("direction", "asc");
	let a = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28"
	};
	t && (a.Authorization = `Bearer ${t}`);
	let o = await fetch(i.toString(), { headers: a });
	if (!o.ok) {
		let e = await o.text();
		throw Error(`GitHub API error (${o.status}): ${e}`);
	}
	return (await o.json()).filter((e) => !e.pull_request);
}
async function us(e, t) {
	let { data: n, error: r } = await (await $()).from("issues").select("issue_number, analysis_summary").eq("repo_name", e).eq("status", "open").order("created_at", { ascending: !1 }).limit(50);
	return r ? (console.error("Error fetching history:", r), []) : n || [];
}
function ds(e) {
	if (!e) return {};
	let t = {}, n = /###\s+(.+?)(?:\r?\n)+([\s\S]*?)(?=###\s+|$)/g, r;
	for (; (r = n.exec(e)) !== null;) {
		let e = r[1].trim();
		t[e] = r[2].trim();
	}
	let i = (e) => {
		for (let n of e) if (t[n]) return t[n];
		return null;
	};
	return {
		primary_description: i([
			"Bug Description",
			"Feature Description",
			"What documentation is missing?",
			"Task Description",
			"Vulnerability Type",
			"Current Problem",
			"Missing Tests"
		]),
		context_steps: i([
			"Steps to Reproduce",
			"Current Design",
			"Why is it useful?",
			"Which page?",
			"Slow page",
			"Affected Components"
		]),
		expected_outcome: i([
			"Expected Behavior",
			"Suggested Improvement",
			"Proposed Improvement",
			"Expected Output",
			"Impact",
			"Suggested Fix",
			"Alternatives considered?"
		]),
		technical_metrics: i([
			"CPU Usage",
			"Memory Usage",
			"Logs",
			"Browser",
			"OS",
			"Files to modify",
			"Affected Files"
		])
	};
}
async function fs(e, t, n = 3) {
	for (let r = 0; r < n; r++) try {
		return await e.chat.completions.create(t);
	} catch (e) {
		if (e.status === 429 && r < n - 1) {
			let t = 6e3, n = e.message?.match(/Please try again in ([\d.]+)s/);
			n && (t = Math.ceil(parseFloat(n[1]) * 1e3) + 500), console.warn(`Rate limit hit. Waiting ${t}ms before retry...`), await is(t);
		} else throw e;
	}
}
async function ps(e, t, n) {
	let r = new Q({
		apiKey: n,
		dangerouslyAllowBrowser: !0
	}), i = t.map((e) => `[Issue ID: #${e.issue_number}]\nTitle: ${e.title || "Unknown Title"}\nTechnical Summary: ${e.analysis_summary}`).join("\n\n---\n\n"), a = ds(e.body || ""), o = (await fs(r, {
		messages: [{
			role: "system",
			content: "You are an expert GitHub triage AI.\nThe user is drafting a new issue. I am providing you with a list of currently OPEN issues in this repository.\nDo not assume any issues have been resolved, because they are all actively open.\nYour job is to determine if the user's draft is a DUPLICATE of one of these specific OPEN issues.\nIf they are reporting a bug that already exists in this open list, flag it as a duplicate.\nYou must respond in valid JSON format matching this schema:\n{ \"is_duplicate\": boolean, \"analysis_summary\": \"string\" }\nEnsure the JSON is well-formed."
		}, {
			role: "user",
			content: Uo(Ho, Wo({
				issue_number: e.number,
				title: e.title,
				primary_description: a.primary_description || e.body || "No description provided.",
				context_steps: a.context_steps,
				expected_outcome: a.expected_outcome,
				technical_metrics: a.technical_metrics
			}, i))
		}],
		model: "llama-3.3-70b-versatile",
		temperature: .1,
		response_format: { type: "json_object" }
	})).choices[0]?.message?.content?.trim();
	if (!o) throw Error("Groq API returned an empty response.");
	return JSON.parse(o);
}
async function ms(e, t, n, r) {
	let { error: i } = await (await $()).from("issues").insert({
		repo_name: e,
		issue_number: t.number,
		is_duplicate: n.is_duplicate,
		analysis_summary: n.analysis_summary,
		status: "open"
	});
	if (i) {
		let e = JSON.stringify(i) || String(i);
		throw console.error("Supabase insert error details:", e), Error(`Supabase insert failed: ${e}`);
	}
}
async function hs(e, t, n, r) {
	let { error: i } = await (await $()).from("public_ecosystem_registry").upsert({
		repo_name: e,
		total_issues_analyzed: t,
		duplicates_found: n,
		last_updated: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "repo_name" });
	if (i) {
		let e = JSON.stringify(i) || String(i);
		throw console.error("Supabase registry update error details:", e), Error(`Registry update failed: ${e}`);
	}
}
async function gs(e, t, n) {
	let { data: r, error: i } = await t.from("issues").select("issue_number").eq("repo_name", e).eq("status", "open");
	if (i || !r) return;
	let a = new Set(n.map((e) => e.number)), o = r.map((e) => e.issue_number).filter((e) => !a.has(e));
	if (o.length > 0) {
		console.log(`RepoOwl: Found ${o.length} issues that are no longer open. Updating...`);
		let { error: n } = await t.from("issues").update({ status: "closed" }).eq("repo_name", e).in("issue_number", o);
		n && console.error("Error closing issues in Supabase:", n);
	}
}
async function _s(e) {
	let t = await chrome.storage.local.get(["repoOwlConfig", "trackedRepositories"]), n = t.repoOwlConfig || {}, r = e || t.trackedRepositories || [];
	return n.groqApiKey, n.supabaseUrl ||= "https://sdgazpgnenkammrlhjel.supabase.co", n.supabaseAnonKey ||= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", {
		keys: n,
		repos: r
	};
}
function vs(e) {
	return (t) => {
		typeof chrome < "u" && chrome.runtime && chrome.runtime.sendMessage({
			action: "sync_progress",
			message: t,
			log_type: e
		}).catch(() => {}), console.log(`[${e}] ${t}`);
	};
}
async function ys(e, t, n) {
	let r = !1, i = null, a = await fetch(`https://api.github.com/repos/${e}`, { headers: {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
		Authorization: `Bearer ${t.githubToken}`
	} });
	if (!a.ok) return n(`[${e}] Failed to fetch repo meta. Check token/permissions.`), null;
	let o = await a.json();
	if (r = o.permissions?.push === !0 || o.permissions?.admin === !0, !r) try {
		let e = await fetch("https://api.github.com/user", { headers: {
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			Authorization: `Bearer ${t.githubToken}`
		} });
		e.ok && (i = (await e.json()).login);
	} catch (t) {
		n(`[${e}] Error fetching your GitHub username: ${t.message}`);
	}
	return {
		isMaintainer: r,
		currentUserLogin: i
	};
}
async function bs(e = null) {
	let { keys: t, repos: n } = await _s(e), r = vs("issue");
	if (!t.groqApiKey || !t.supabaseUrl) {
		r("RepoOwl: API Keys not configured. Skipping sync.");
		return;
	}
	let i = await Xo();
	if (i.error) {
		r(`RepoOwl: Could not authenticate with Supabase: ${i.error}`);
		return;
	}
	let a = await $();
	for (let e of n) {
		r(`\n[${e}] Starting issue sync...`);
		let n = !1, i = null;
		try {
			let a = await ys(e, t, r);
			if (!a) continue;
			if (n = a.isMaintainer, i = a.currentUserLogin, n) {
				r(`[${e}] Confirmed Maintainer. Fetching issues...`);
				try {
					await os(e, t), await ss(e, t, r);
				} catch (t) {
					r(`[${e}] Warning: Failed to auto-publish Hub config: ${t.message}`);
				}
			} else {
				r(`[${e}] Contributor detected. Starting Sandbox sync...`);
				try {
					let [t, n] = e.split("/"), i = null;
					fromClient = !0, i = Ki("https://sdgazpgnenkammrlhjel.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", { auth: { persistSession: !1 } });
					let a = null;
					if (i) {
						let { data: o, error: s } = await i.from("registry").select("supabase_url, supabase_anon_key").eq("owner", t).eq("repo", n).single();
						!s && o && (a = {
							supabaseUrl: o.supabase_url,
							supabaseAnonKey: o.supabase_anon_key
						}, r(`[${e}] Discovered Hub config from Central Mediator.`));
					}
					if (!a) {
						r(`[${e}] Central Mediator returned no config. Falling back to repoowl.json...`);
						let t = await fetch(`https://raw.githubusercontent.com/${e}/main/repoowl.json`);
						t.ok && (a = await t.json(), r(`[${e}] Discovered Hub config from repoowl.json.`));
					}
					if (a) {
						let { data: t, error: n } = await Ki(a.supabaseUrl, a.supabaseAnonKey, { auth: { persistSession: !1 } }).from("issues").select("id, issue_number, is_duplicate, analysis_summary").eq("repo_name", e).eq("status", "open");
						!n && t && (await chrome.storage.local.set({ [`hub_cache_${e}`]: t }), r(`[${e}] Hydrated UI with ${t.length} issues from Maintainer's Hub.`));
					} else r(`[${e}] No public Hub found for this repository.`);
				} catch (t) {
					r(`[${e}] Error hydrating Hub data: ${t.message}`);
				}
			}
		} catch (t) {
			r(`[${e}] Error checking permissions: ${t.message}`);
			continue;
		}
		let { data: o } = await a.from("issues").select("issue_number, is_duplicate").eq("repo_name", e), s = new Set((o || []).map((e) => e.issue_number)), c = s.size, l = (o || []).filter((e) => e.is_duplicate).length, u = await ls(e, t.githubToken);
		n && await gs(e, a, u);
		let d = u.filter((e) => !s.has(e.number));
		n ? r(`[${e}] ${s.size} already processed. ${d.length} issues need processing.`) : i ? (d = d.filter((e) => e.user && e.user.login === i), r(`[${e}] Found ${d.length} unprocessed issues authored by you.`)) : (r(`[${e}] Could not determine your GitHub username, skipping sandbox processing.`), d = []);
		for (let n of d) try {
			r(`[${e}] Processing issue #${n.number}...`);
			let i = await us(e, t);
			i.forEach((e) => {
				let t = u.find((t) => t.number === e.issue_number);
				t && (e.title = t.title);
			});
			let a = await ps(n, i, t.groqApiKey);
			await ms(e, n, a, t), c++, a.is_duplicate && l++, await is(rs);
		} catch (t) {
			let i = t.message || String(t);
			r(`[${e}] Error processing issue #${n.number}: ${i}`);
			continue;
		}
		let f = c, p = l;
		if (!n) {
			let t = (await chrome.storage.local.get([`hub_cache_${e}`]))[`hub_cache_${e}`] || [], n = new Set(t.map((e) => e.issue_number));
			s.forEach((e) => n.add(e)), f = n.size, p = l + t.filter((e) => e.is_duplicate).length;
		}
		await hs(e, f, p, t), r(`[${e}] Issue Sync complete. Total Analyzed: ${f}, Duplicates: ${p}`);
	}
}
async function xs(e = null) {
	let { keys: t, repos: n } = await _s(e), r = vs("pr");
	if (!t.groqApiKey || !t.supabaseUrl) {
		r("RepoOwl: API Keys not configured. Skipping sync.");
		return;
	}
	let i = await Xo();
	if (i.error) {
		r(`RepoOwl: Could not authenticate with Supabase: ${i.error}`);
		return;
	}
	let a = await $();
	for (let e of n) {
		r(`\n[${e}] Starting PR sync...`);
		let n = !1, i = null;
		try {
			let a = await ys(e, t, r);
			if (!a) continue;
			n = a.isMaintainer, i = a.currentUserLogin;
		} catch (t) {
			r(`[${e}] Error checking permissions: ${t.message}`);
			continue;
		}
		let { data: o } = await a.from("pull_requests").select("pr_number").eq("repo_name", e), s = new Set((o || []).map((e) => e.pr_number)), c = [];
		try {
			c = (await Zo(e, t.githubToken)).filter((e) => !s.has(e.number)), !n && i ? c = c.filter((e) => e.user && e.user.login === i) : n || (c = []), r(`[${e}] ${s.size} PRs already analyzed. ${c.length} PRs need processing.`);
		} catch (t) {
			r(`[${e}] Error fetching PRs: ${t.message}`);
		}
		for (let n of c) try {
			r(`[${e}] Analyzing PR #${n.number} (Slop Detection)...`), await ns(e, n, t), await is(rs);
		} catch (t) {
			r(`[${e}] Error processing PR #${n.number}: ${t.message}`);
		}
		r(`[${e}] PR Sync complete.`);
	}
}
//#endregion
