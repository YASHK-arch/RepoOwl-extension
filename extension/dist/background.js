//#region \0rolldown/runtime.js
var e = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region ../node_modules/tslib/tslib.es6.mjs
function t(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function n(e, t, n, r) {
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
var r = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), i = class extends Error {
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
}, a = class extends i {
	constructor(e) {
		super("Failed to send a request to the Edge Function", "FunctionsFetchError", e);
	}
}, o = class extends i {
	constructor(e) {
		super("Relay Error invoking the Edge Function", "FunctionsRelayError", e);
	}
}, s = class extends i {
	constructor(e) {
		super("Edge Function returned a non-2xx status code", "FunctionsHttpError", e);
	}
}, c;
(function(e) {
	e.Any = "any", e.ApNortheast1 = "ap-northeast-1", e.ApNortheast2 = "ap-northeast-2", e.ApSouth1 = "ap-south-1", e.ApSoutheast1 = "ap-southeast-1", e.ApSoutheast2 = "ap-southeast-2", e.CaCentral1 = "ca-central-1", e.EuCentral1 = "eu-central-1", e.EuWest1 = "eu-west-1", e.EuWest2 = "eu-west-2", e.EuWest3 = "eu-west-3", e.SaEast1 = "sa-east-1", e.UsEast1 = "us-east-1", e.UsWest1 = "us-west-1", e.UsWest2 = "us-west-2";
})(c ||= {});
//#endregion
//#region ../node_modules/@supabase/functions-js/dist/module/FunctionsClient.js
var l = class {
	constructor(e, { headers: t = {}, customFetch: n, region: i = c.Any } = {}) {
		this.url = e, this.headers = t, this.region = i, this.fetch = r(n);
	}
	setAuth(e) {
		this.headers.Authorization = `Bearer ${e}`;
	}
	invoke(e) {
		return n(this, arguments, void 0, function* (e, t = {}) {
			let n, r;
			try {
				let { headers: i, method: c, body: l, signal: u, timeout: d } = t, f = {}, { region: p } = t;
				p ||= this.region;
				let m = new URL(`${this.url}/${e}`);
				p && p !== "any" && (f["x-region"] = p, m.searchParams.set("forceFunctionRegion", p));
				let h, g = !!i && Object.keys(i).some((e) => e.toLowerCase() === "content-type");
				l && !g ? typeof Blob < "u" && l instanceof Blob || l instanceof ArrayBuffer ? (f["Content-Type"] = "application/octet-stream", h = l) : typeof l == "string" ? (f["Content-Type"] = "text/plain", h = l) : typeof FormData < "u" && l instanceof FormData ? h = l : (f["Content-Type"] = "application/json", h = JSON.stringify(l)) : h = l && typeof l != "string" && !(typeof Blob < "u" && l instanceof Blob) && !(l instanceof ArrayBuffer) && !(typeof FormData < "u" && l instanceof FormData) ? JSON.stringify(l) : l;
				let _ = u;
				d && (r = new AbortController(), n = setTimeout(() => r.abort(), d), u ? (_ = r.signal, u.addEventListener("abort", () => r.abort())) : _ = r.signal);
				let v = yield this.fetch(m.toString(), {
					method: c || "POST",
					headers: Object.assign(Object.assign(Object.assign({}, f), this.headers), i),
					body: h,
					signal: _
				}).catch((e) => {
					throw new a(e);
				}), y = v.headers.get("x-relay-error");
				if (y && y === "true") throw new o(v);
				if (!v.ok) throw new s(v);
				let b = (v.headers.get("Content-Type") ?? "text/plain").split(";")[0].trim(), x;
				return x = b === "application/json" ? yield v.json() : b === "application/octet-stream" || b === "application/pdf" ? yield v.blob() : b === "text/event-stream" ? v : b === "multipart/form-data" ? yield v.formData() : yield v.text(), {
					data: x,
					error: null,
					response: v
				};
			} catch (e) {
				return {
					data: null,
					error: e,
					response: e instanceof s || e instanceof o ? e.context : void 0
				};
			} finally {
				n && clearTimeout(n);
			}
		});
	}
}, u = 3, d = (e) => Math.min(1e3 * 2 ** e, 3e4), f = [520, 503], p = [
	"GET",
	"HEAD",
	"OPTIONS"
], m = class extends Error {
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
function h(e, t) {
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
function g(e, t, n, r) {
	return !(!r || n >= u || !p.includes(e) || !f.includes(t));
}
var _ = class {
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
					if (t?.name === "AbortError" || t?.code === "ABORT_ERR" || !p.includes(n.method)) throw t;
					if (n.retryEnabled && e < u) {
						let t = d(e);
						e++, await h(t, n.signal);
						continue;
					}
					throw t;
				}
				if (g(n.method, i.status, e, n.retryEnabled)) {
					let t = i.headers?.get("Retry-After") ?? null, r = t === null ? d(e) : Math.max(0, parseInt(t, 10) || 0) * 1e3;
					await i.text(), e++, await h(r, n.signal);
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
					if (n = { message: i }, r = null, t.shouldThrowOnError) throw new m({
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
			if (n && t.shouldThrowOnError) throw new m(n);
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
}, v = class extends _ {
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
}, y = /* @__PURE__ */ RegExp("[,()]"), b = class extends v {
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
		let n = Array.from(new Set(t)).map((e) => typeof e == "string" && y.test(e) ? `"${e}"` : `${e}`).join(",");
		return this.url.searchParams.append(e, `in.(${n})`), this;
	}
	notIn(e, t) {
		let n = Array.from(new Set(t)).map((e) => typeof e == "string" && y.test(e) ? `"${e}"` : `${e}`).join(",");
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
}, x = class {
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
		return s.searchParams.set("select", o), r && c.append("Prefer", `count=${r}`), new b({
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
		return new b({
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
		return new b({
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
		return t && r.append("Prefer", `count=${t}`), new b({
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
		return e && n.append("Prefer", `count=${e}`), new b({
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
function ee(e) {
	"@babel/helpers - typeof";
	return ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, ee(e);
}
function te(e, t) {
	if (ee(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (ee(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function ne(e) {
	var t = te(e, "string");
	return ee(t) == "symbol" ? t : t + "";
}
function re(e, t, n) {
	return (t = ne(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function ie(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function ae(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? ie(Object(n), !0).forEach(function(t) {
			re(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ie(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
var oe = class e {
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
				return a.addEventListener("abort", i, { once: !0 }), s(e, ae(ae({}, t), {}, { signal: n.signal })).finally(() => {
					clearTimeout(r), a.removeEventListener("abort", i);
				});
			}
			return s(e, ae(ae({}, t), {}, { signal: n.signal })).finally(() => clearTimeout(r));
		} : this.fetch = s, this.retry = o;
	}
	from(e) {
		if (!e || typeof e != "string" || e.trim() === "") throw Error("Invalid relation name: relation must be a non-empty string.");
		return new x(new URL(`${this.url}/${e}`), {
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
		return l ? u.set("Prefer", i ? `count=${i},return=minimal` : "return=minimal") : i && u.set("Prefer", `count=${i}`), new b({
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
}, se = class {
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
}, ce = "realtime-js/2.110.3", le = "1.0.0", ue = "2.0.0", de = ue, fe = 1e4, S = {
	closed: "closed",
	errored: "errored",
	joined: "joined",
	joining: "joining",
	leaving: "leaving"
}, pe = {
	close: "phx_close",
	error: "phx_error",
	join: "phx_join",
	reply: "phx_reply",
	leave: "phx_leave",
	access_token: "access_token"
}, me = {
	connecting: "connecting",
	open: "open",
	closing: "closing",
	closed: "closed"
}, he = class {
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
}, C;
(function(e) {
	e.abstime = "abstime", e.bool = "bool", e.date = "date", e.daterange = "daterange", e.float4 = "float4", e.float8 = "float8", e.int2 = "int2", e.int4 = "int4", e.int4range = "int4range", e.int8 = "int8", e.int8range = "int8range", e.json = "json", e.jsonb = "jsonb", e.money = "money", e.numeric = "numeric", e.oid = "oid", e.reltime = "reltime", e.text = "text", e.time = "time", e.timestamp = "timestamp", e.timestamptz = "timestamptz", e.timetz = "timetz", e.tsrange = "tsrange", e.tstzrange = "tstzrange";
})(C ||= {});
var ge = (e, t, n = {}) => {
	let r = n.skipTypes ?? [];
	return t ? Object.keys(t).reduce((n, i) => (n[i] = _e(i, e, t, r), n), {}) : {};
}, _e = (e, t, n, r) => {
	let i = t.find((t) => t.name === e)?.type, a = n[e];
	return i && !r.includes(i) ? ve(i, a) : ye(a);
}, ve = (e, t) => {
	if (e.charAt(0) === "_") return Ce(t, e.slice(1, e.length));
	switch (e) {
		case C.bool: return be(t);
		case C.float4:
		case C.float8:
		case C.int2:
		case C.int4:
		case C.int8:
		case C.numeric:
		case C.oid: return xe(t);
		case C.json:
		case C.jsonb: return Se(t);
		case C.timestamp: return we(t);
		case C.abstime:
		case C.date:
		case C.daterange:
		case C.int4range:
		case C.int8range:
		case C.money:
		case C.reltime:
		case C.text:
		case C.time:
		case C.timestamptz:
		case C.timetz:
		case C.tsrange:
		case C.tstzrange: return ye(t);
		default: return ye(t);
	}
}, ye = (e) => e, be = (e) => {
	switch (e) {
		case "t": return !0;
		case "f": return !1;
		default: return e;
	}
}, xe = (e) => {
	if (typeof e == "string") {
		let t = parseFloat(e);
		if (!Number.isNaN(t)) return t;
	}
	return e;
}, Se = (e) => {
	if (typeof e == "string") try {
		return JSON.parse(e);
	} catch {
		return e;
	}
	return e;
}, Ce = (e, t) => {
	if (typeof e != "string") return e;
	let n = e.length - 1, r = e[n];
	if (e[0] === "{" && r === "}") {
		let r, i = e.slice(1, n);
		try {
			r = JSON.parse("[" + i + "]");
		} catch {
			r = i ? i.split(",") : [];
		}
		return r.map((e) => ve(t, e));
	}
	return e;
}, we = (e) => typeof e == "string" ? e.replace(" ", "T") : e, Te = (e) => {
	let t = new URL(e);
	return t.protocol = t.protocol.replace(/^ws/i, "http"), t.pathname = t.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, ""), t.pathname === "" || t.pathname === "/" ? t.pathname = "/api/broadcast" : t.pathname += "/api/broadcast", t.href;
}, Ee = (e) => typeof e == "function" ? e : function() {
	return e;
}, De = typeof self < "u" ? self : null, Oe = typeof window < "u" ? window : null, ke = De || Oe || globalThis, Ae = "2.0.0", je = 1e4, Me = 1e3, Ne = {
	connecting: 0,
	open: 1,
	closing: 2,
	closed: 3
}, w = {
	closed: "closed",
	errored: "errored",
	joined: "joined",
	joining: "joining",
	leaving: "leaving"
}, Pe = {
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
		this.state = w.closed, this.topic = e, this.params = Ee(t || {}), this.socket = n, this.bindings = [], this.bindingRef = 0, this.timeout = this.socket.timeout, this.joinedOnce = !1, this.joinPush = new Re(this, Pe.join, this.params, this.timeout), this.pushBuffer = [], this.stateChangeRefs = [], this.rejoinTimer = new ze(() => {
			this.socket.isConnected() && this.rejoin();
		}, this.socket.rejoinAfterMs), this.stateChangeRefs.push(this.socket.onError(() => this.rejoinTimer.reset())), this.stateChangeRefs.push(this.socket.onOpen(() => {
			this.rejoinTimer.reset(), this.isErrored() && this.rejoin();
		})), this.joinPush.receive("ok", () => {
			this.state = w.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((e) => e.send()), this.pushBuffer = [];
		}), this.joinPush.receive("error", (e) => {
			this.state = w.errored, this.socket.hasLogger() && this.socket.log("channel", `error ${this.topic}`, e), this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
		}), this.onClose(() => {
			this.rejoinTimer.reset(), this.socket.hasLogger() && this.socket.log("channel", `close ${this.topic}`), this.state = w.closed, this.socket.remove(this);
		}), this.onError((e) => {
			this.socket.hasLogger() && this.socket.log("channel", `error ${this.topic}`, e), this.isJoining() && this.joinPush.reset(), this.state = w.errored, this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
		}), this.joinPush.receive("timeout", () => {
			this.socket.hasLogger() && this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), new Re(this, Pe.leave, Ee({}), this.timeout).send(), this.state = w.errored, this.joinPush.reset(), this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
		}), this.on(Pe.reply, (e, t) => {
			this.trigger(this.replyEventName(t), e);
		});
	}
	join(e = this.timeout) {
		if (this.joinedOnce) throw Error("tried to join multiple times. 'join' can only be called a single time per channel instance");
		return this.timeout = e, this.joinedOnce = !0, this.rejoin(), this.joinPush;
	}
	teardown() {
		this.pushBuffer.forEach((e) => e.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = w.closed, this.bindings = [];
	}
	onClose(e) {
		this.on(Pe.close, e);
	}
	onError(e) {
		return this.on(Pe.error, (t) => e(t));
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
		this.rejoinTimer.reset(), this.joinPush.cancelTimeout(), this.state = w.leaving;
		let t = () => {
			this.socket.hasLogger() && this.socket.log("channel", `leave ${this.topic}`), this.trigger(Pe.close, "leave");
		}, n = new Re(this, Pe.leave, Ee({}), e);
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
		this.isLeaving() || (this.socket.leaveOpenTopic(this.topic), this.state = w.joining, this.joinPush.resend(e));
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
		return this.state === w.closed;
	}
	isErrored() {
		return this.state === w.errored;
	}
	isJoined() {
		return this.state === w.joined;
	}
	isJoining() {
		return this.state === w.joining;
	}
	isLeaving() {
		return this.state === w.leaving;
	}
}, Ve = class {
	static request(e, t, n, r, i, a, o) {
		if (ke.XDomainRequest) {
			let n = new ke.XDomainRequest();
			return this.xdomainRequest(n, e, t, r, i, a, o);
		} else if (ke.XMLHttpRequest) {
			let s = new ke.XMLHttpRequest();
			return this.xhrRequest(s, e, t, n, r, i, a, o);
		} else if (ke.fetch && ke.AbortController) return this.fetchRequest(e, t, n, r, i, a, o);
		else throw Error("No suitable XMLHttpRequest implementation found");
	}
	static fetchRequest(e, t, n, r, i, a, o) {
		let s = {
			method: e,
			headers: n,
			body: r
		}, c = null;
		return i && (c = new AbortController(), setTimeout(() => c.abort(), i), s.signal = c.signal), ke.fetch(t, s).then((e) => e.text()).then((e) => this.parseJSON(e)).then((e) => o && o(e)).catch((e) => {
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
		t && t.length === 2 && t[1].startsWith(Le) && (this.authToken = atob(t[1].slice(Le.length))), this.endPoint = null, this.token = null, this.skipHeartbeat = !0, this.reqs = /* @__PURE__ */ new Set(), this.awaitingBatchAck = !1, this.currentBatch = null, this.currentBatchTimer = null, this.batchBuffer = [], this.onopen = function() {}, this.onerror = function() {}, this.onmessage = function() {}, this.onclose = function() {}, this.pollEndpoint = this.normalizeEndpoint(e), this.readyState = Ne.connecting, setTimeout(() => this.poll(), 0);
	}
	normalizeEndpoint(e) {
		return e.replace("ws://", "http://").replace("wss://", "https://").replace(RegExp("(.*)/" + Fe.websocket), "$1/" + Fe.longpoll);
	}
	endpointURL() {
		return Ve.appendParams(this.pollEndpoint, { token: this.token });
	}
	closeAndRetry(e, t, n) {
		this.close(e, t, n), this.readyState = Ne.connecting;
	}
	ontimeout() {
		this.onerror("timeout"), this.closeAndRetry(1005, "timeout", !1);
	}
	isActive() {
		return this.readyState === Ne.open || this.readyState === Ne.connecting;
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
					this.readyState = Ne.open, this.onopen({}), this.poll();
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
		this.readyState = Ne.closed;
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
			event: Pe.reply,
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
		}, this.channels = [], this.sendBuffer = [], this.ref = 0, this.fallbackRef = null, this.timeout = t.timeout || je, this.transport = t.transport || ke.WebSocket || Ue, this.conn = void 0, this.primaryPassedHealthCheck = !1, this.longPollFallbackMs = t.longPollFallbackMs, this.fallbackTimer = null;
		let n = null;
		try {
			n = ke && ke.sessionStorage;
		} catch {}
		this.sessionStore = t.sessionStorage || n, this.establishedConnections = 0, this.defaultEncoder = Ge.encode.bind(Ge), this.defaultDecoder = Ge.decode.bind(Ge), this.closeWasClean = !0, this.disconnecting = !1, this.binaryType = t.binaryType || "arraybuffer", this.connectClock = 1, this.pageHidden = !1, this.encode = void 0, this.decode = void 0, this.transport === Ue ? (this.encode = this.defaultEncoder, this.decode = this.defaultDecoder) : (this.encode = t.encode || this.defaultEncoder, this.decode = t.decode || this.defaultDecoder);
		let r = null;
		Oe && Oe.addEventListener && (Oe.addEventListener("pagehide", (e) => {
			this.conn && (this.disconnect(), r = this.connectClock);
		}), Oe.addEventListener("pageshow", (e) => {
			r === this.connectClock && (r = null, this.connect());
		}), Oe.addEventListener("visibilitychange", () => {
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
		}), this.longpollerTimeout = t.longpollerTimeout || 2e4, this.params = Ee(t.params || {}), this.endPoint = `${e}/${Fe.websocket}`, this.vsn = t.vsn || Ae, this.heartbeatTimeoutTimer = null, this.heartbeatTimer = null, this.heartbeatSentAt = null, this.pendingHeartbeatRef = null, this.reconnectTimer = new ze(() => {
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
		e && (console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor"), this.params = Ee(e)), !(this.conn && !this.disconnecting) && (this.longPollFallbackMs && this.transport !== Ue ? this.connectWithFallback(Ue, this.longPollFallbackMs) : this.transportConnect());
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
			this.triggerChanError(/* @__PURE__ */ Error("heartbeat timeout")), this.closeWasClean = !1, this.teardown(() => this.reconnectTimer.scheduleTimeout(), Me, "heartbeat timeout");
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
		if (n === 5 || e.readyState === Ne.closed) {
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
			t.isErrored() || t.isLeaving() || t.isClosed() || t.trigger(Pe.error, e);
		});
	}
	connectionState() {
		switch (this.conn && this.conn.readyState) {
			case Ne.connecting: return "connecting";
			case Ne.open: return "open";
			case Ne.closing: return "closing";
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
		return this.socket.isConnected() && this.state === S.joined;
	}
	isJoined() {
		return this.state === S.joined;
	}
	isJoining() {
		return this.state === S.joining;
	}
	isClosed() {
		return this.state === S.closed;
	}
	isLeaving() {
		return this.state === S.leaving;
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
var ft;
(function(e) {
	e.SUBSCRIBED = "SUBSCRIBED", e.TIMED_OUT = "TIMED_OUT", e.CLOSED = "CLOSED", e.CHANNEL_ERROR = "CHANNEL_ERROR";
})(ft ||= {});
var pt = class e {
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
		}), this._updateFilterTransform(), this.broadcastEndpointURL = Te(this.socket.socketAdapter.endPointURL()), this.private = this.params.config.private || !1, !this.private && this.params.config?.broadcast?.replay) throw Error(`tried to use replay on public channel '${this.topic}'. It must be a private channel.`);
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
				e?.(ft.CHANNEL_ERROR, et(t));
			}), this._onClose(() => e?.(ft.CLOSED)), this.updateJoinPayload(Object.assign({ config: c }, s)), this._updateFilterMessage(), this.channelAdapter.subscribe(t).receive("ok", async ({ postgres_changes: t }) => {
				if (this.socket._isManualToken() || this.socket.setAuth(), t === void 0) {
					e?.(ft.SUBSCRIBED);
					return;
				}
				this._updatePostgresBindings(t, e);
			}).receive("error", (t) => {
				this.state = S.errored;
				let n = Object.values(t).join(", ") || "error";
				e?.(ft.CHANNEL_ERROR, Error(n, { cause: t }));
			}).receive("timeout", () => {
				e?.(ft.TIMED_OUT);
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
				this.unsubscribe(), this.state = S.errored, n?.(ft.CHANNEL_ERROR, /* @__PURE__ */ Error("mismatch between server and client bindings for postgres changes"));
				return;
			}
		}
		this.bindings.postgres_changes = a, this.state != S.errored && n && n(ft.SUBSCRIBED);
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
		let { close: n, error: r, leave: i, join: a } = pe;
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
		return (e.type === "INSERT" || e.type === "UPDATE") && (t.new = ge(e.columns, e.record)), (e.type === "UPDATE" || e.type === "DELETE") && (t.old = ge(e.columns, e.old_record)), t;
	}
}, mt = class {
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
		return this.socket.connectionState() == me.connecting;
	}
	isDisconnecting() {
		return this.socket.connectionState() == me.closing;
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
}, ht = {
	HEARTBEAT_INTERVAL: 25e3,
	RECONNECT_DELAY: 10,
	HEARTBEAT_TIMEOUT_FALLBACK: 100
}, gt = [
	1e3,
	2e3,
	5e3,
	1e4
], _t = 1e4;
function vt() {
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
function yt() {
	try {
		if (typeof globalThis < "u" && globalThis.sessionStorage) return globalThis.sessionStorage;
	} catch {}
	return vt();
}
var bt = "\n  addEventListener(\"message\", (e) => {\n    if (e.data.event === \"start\") {\n      setInterval(() => postMessage({ event: \"keepAlive\" }), e.data.interval);\n    }\n  });", xt = class {
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
		if (this.channels = [], this.accessTokenValue = null, this.accessToken = null, this.apiKey = null, this.httpEndpoint = "", this.headers = {}, this.params = {}, this.ref = 0, this.serializer = new he(), this._manuallySetToken = !1, this._authPromise = null, this._workerHeartbeatTimer = void 0, this._pendingWorkerHeartbeatRef = null, this._pendingDisconnectTimer = null, this._disconnectOnEmptyChannelsAfterMs = 0, this._resolveFetch = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), !t?.params?.apikey) throw Error("API key is required to connect to Realtime");
		this.apiKey = t.params.apikey;
		let n = this._initializeOptions(t);
		this.socketAdapter = new mt(e, n), this.httpEndpoint = Te(e), this.fetch = this._resolveFetch(t?.fetch);
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
		return this.socketAdapter.connectionState() || me.closed;
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
			let n = new pt(`realtime:${e}`, t, this);
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
				version: ce
			};
			t && e.updateJoinPayload(n), e.joinedOnce && e.channelAdapter.isJoined() && e.channelAdapter.push(pe.access_token, { access_token: t });
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
			let e = new Blob([bt], { type: "application/javascript" });
			t = URL.createObjectURL(e);
		}
		return t;
	}
	_initializeOptions(e) {
		this.worker = e?.worker ?? !1, this.accessToken = e?.accessToken ?? null;
		let t = {};
		t.timeout = e?.timeout ?? fe, t.heartbeatIntervalMs = e?.heartbeatIntervalMs ?? ht.HEARTBEAT_INTERVAL, this._disconnectOnEmptyChannelsAfterMs = e?.disconnectOnEmptyChannelsAfterMs ?? 2 * (e?.heartbeatIntervalMs ?? ht.HEARTBEAT_INTERVAL), t.transport = e?.transport ?? se.getWebSocketConstructor(), t.params = e?.params, t.logger = e?.logger, t.heartbeatCallback = this._wrapHeartbeatCallback(e?.heartbeatCallback), t.sessionStorage = e?.sessionStorage ?? yt(), t.reconnectAfterMs = e?.reconnectAfterMs ?? ((e) => gt[e - 1] || _t);
		let n, r, i = e?.vsn ?? de;
		switch (i) {
			case le:
				n = (e, t) => t(JSON.stringify(e)), r = (e, t) => t(JSON.parse(e));
				break;
			case ue:
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
}, St = class extends Error {
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
function Ct(e, t, n) {
	let r = new URL(t, e);
	if (n) for (let [e, t] of Object.entries(n)) t !== void 0 && r.searchParams.set(e, t);
	return r.toString();
}
async function wt(e) {
	return !e || e.type === "none" ? {} : e.type === "bearer" ? { Authorization: `Bearer ${e.token}` } : e.type === "header" ? { [e.name]: e.value } : e.type === "custom" ? await e.getHeaders() : {};
}
function Tt(e) {
	let t = e.fetchImpl ?? globalThis.fetch;
	return { async request({ method: n, path: r, query: i, body: a, headers: o }) {
		let s = Ct(e.baseUrl, r, i), c = await wt(e.auth), l = await t(s, {
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
			throw new St(t?.message ?? `Request failed with status ${l.status}`, {
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
function Et(e) {
	return e.join("");
}
var Dt = class {
	constructor(e, t = "") {
		this.client = e, this.prefix = t;
	}
	async listNamespaces(e) {
		let t = e ? { parent: Et(e.namespace) } : void 0;
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
			path: `${this.prefix}/namespaces/${Et(e.namespace)}`
		});
	}
	async loadNamespaceMetadata(e) {
		return { properties: (await this.client.request({
			method: "GET",
			path: `${this.prefix}/namespaces/${Et(e.namespace)}`
		})).data.properties };
	}
	async namespaceExists(e) {
		try {
			return await this.client.request({
				method: "HEAD",
				path: `${this.prefix}/namespaces/${Et(e.namespace)}`
			}), !0;
		} catch (e) {
			if (e instanceof St && e.status === 404) return !1;
			throw e;
		}
	}
	async createNamespaceIfNotExists(e, t) {
		try {
			return await this.createNamespace(e, t);
		} catch (e) {
			if (e instanceof St && e.status === 409) return;
			throw e;
		}
	}
};
function Ot(e) {
	return e.join("");
}
var kt = class {
	constructor(e, t = "", n) {
		this.client = e, this.prefix = t, this.accessDelegation = n;
	}
	async listTables(e) {
		return (await this.client.request({
			method: "GET",
			path: `${this.prefix}/namespaces/${Ot(e.namespace)}/tables`
		})).data.identifiers;
	}
	async createTable(e, t) {
		let n = {};
		return this.accessDelegation && (n["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({
			method: "POST",
			path: `${this.prefix}/namespaces/${Ot(e.namespace)}/tables`,
			body: t,
			headers: n
		})).data.metadata;
	}
	async updateTable(e, t) {
		let n = await this.client.request({
			method: "POST",
			path: `${this.prefix}/namespaces/${Ot(e.namespace)}/tables/${e.name}`,
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
			path: `${this.prefix}/namespaces/${Ot(e.namespace)}/tables/${e.name}`,
			query: { purgeRequested: String(t?.purge ?? !1) }
		});
	}
	async loadTable(e) {
		let t = {};
		return this.accessDelegation && (t["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({
			method: "GET",
			path: `${this.prefix}/namespaces/${Ot(e.namespace)}/tables/${e.name}`,
			headers: t
		})).data.metadata;
	}
	async tableExists(e) {
		let t = {};
		this.accessDelegation && (t["X-Iceberg-Access-Delegation"] = this.accessDelegation);
		try {
			return await this.client.request({
				method: "HEAD",
				path: `${this.prefix}/namespaces/${Ot(e.namespace)}/tables/${e.name}`,
				headers: t
			}), !0;
		} catch (e) {
			if (e instanceof St && e.status === 404) return !1;
			throw e;
		}
	}
	async createTableIfNotExists(e, t) {
		try {
			return await this.createTable(e, t);
		} catch (n) {
			if (n instanceof St && n.status === 409) return await this.loadTable({
				namespace: e.namespace,
				name: t.name
			});
			throw n;
		}
	}
}, At = class {
	constructor(e) {
		let t = "v1";
		e.catalogName && (t += `/${e.catalogName}`);
		let n = e.baseUrl.endsWith("/") ? e.baseUrl : `${e.baseUrl}/`;
		this.client = Tt({
			baseUrl: n,
			auth: e.auth,
			fetchImpl: e.fetch
		}), this.accessDelegation = e.accessDelegation?.join(","), this.namespaceOps = new Dt(this.client, t), this.tableOps = new kt(this.client, t, this.accessDelegation);
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
function jt(e) {
	"@babel/helpers - typeof";
	return jt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, jt(e);
}
function Mt(e, t) {
	if (jt(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (jt(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Nt(e) {
	var t = Mt(e, "string");
	return jt(t) == "symbol" ? t : t + "";
}
function Pt(e, t, n) {
	return (t = Nt(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Ft(e, t) {
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
		t % 2 ? Ft(Object(n), !0).forEach(function(t) {
			Pt(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ft(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
var It = class extends Error {
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
function Lt(e) {
	return typeof e == "object" && !!e && "__isStorageError" in e;
}
var Rt = class extends It {
	constructor(e, t, n, r = "storage") {
		super(e, r, t, n), this.name = r === "vectors" ? "StorageVectorsApiError" : "StorageApiError", this.status = t, this.statusCode = n;
	}
	toJSON() {
		return T({}, super.toJSON());
	}
}, zt = class extends It {
	constructor(e, t, n = "storage") {
		super(e, n), this.name = n === "vectors" ? "StorageVectorsUnknownError" : "StorageUnknownError", this.originalError = t;
	}
};
function Bt(e, t, n) {
	let r = T({}, e), i = t.toLowerCase();
	for (let e of Object.keys(r)) e.toLowerCase() === i && delete r[e];
	return r[i] = n, r;
}
function Vt(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) t[n.toLowerCase()] = r;
	return t;
}
var Ht = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), Ut = (e) => {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}, Wt = (e) => {
	if (Array.isArray(e)) return e.map((e) => Wt(e));
	if (typeof e == "function" || e !== Object(e)) return e;
	let t = {};
	return Object.entries(e).forEach(([e, n]) => {
		let r = e.replace(/([-_][a-z])/gi, (e) => e.toUpperCase().replace(/[-_]/g, ""));
		t[r] = Wt(n);
	}), t;
}, Gt = (e) => !e || typeof e != "string" || e.length === 0 || e.length > 100 || e.trim() !== e || e.includes("/") || e.includes("\\") ? !1 : /^[\w!.\*'() &$@=;:+,?-]+$/.test(e), Kt = (e) => {
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
}, qt = async (e, t, n, r) => {
	if (typeof e == "object" && e && "json" in e && typeof e.json == "function") {
		let n = e, i = parseInt(String(n.status), 10);
		Number.isFinite(i) || (i = 500), n.json().then((e) => {
			let n = e?.statusCode || e?.code || i + "";
			t(new Rt(Kt(e), i, n, r));
		}).catch(() => {
			let e = i + "";
			t(new Rt(n.statusText || `HTTP ${i} error`, i, e, r));
		});
	} else t(new zt(Kt(e), e, r));
}, Jt = (e, t, n, r) => {
	let i = {
		method: e,
		headers: t?.headers || {}
	};
	if (e === "GET" || e === "HEAD" || !r) return T(T({}, i), n);
	if (Ut(r)) {
		let e = t?.headers || {}, n;
		for (let [t, r] of Object.entries(e)) t.toLowerCase() === "content-type" && (n = r);
		i.headers = Bt(e, "Content-Type", n ?? "application/json"), i.body = JSON.stringify(r);
	} else i.body = r;
	return t?.duplex && (i.duplex = t.duplex), T(T({}, i), n);
};
async function Yt(e, t, n, r, i, a, o) {
	return new Promise((s, c) => {
		e(n, Jt(t, r, i, a)).then((e) => {
			if (!e.ok) throw e;
			if (r?.noResolveJson) return e;
			if (o === "vectors") {
				let t = e.headers.get("content-type");
				if (e.headers.get("content-length") === "0" || e.status === 204 || !t || !t.includes("application/json")) return {};
			}
			return e.json();
		}).then((e) => s(e)).catch((e) => qt(e, c, r, o));
	});
}
function Xt(e = "storage") {
	return {
		get: async (t, n, r, i) => Yt(t, "GET", n, r, i, void 0, e),
		post: async (t, n, r, i, a) => Yt(t, "POST", n, i, a, r, e),
		put: async (t, n, r, i, a) => Yt(t, "PUT", n, i, a, r, e),
		head: async (t, n, r, i) => Yt(t, "HEAD", n, T(T({}, r), {}, { noResolveJson: !0 }), i, void 0, e),
		remove: async (t, n, r, i, a) => Yt(t, "DELETE", n, i, a, r, e)
	};
}
var { get: Zt, post: E, put: Qt, head: $t, remove: en } = Xt("storage"), D = Xt("vectors"), tn = class {
	constructor(e, t = {}, n, r = "storage") {
		this.shouldThrowOnError = !1, this.url = e, this.headers = Vt(t), this.fetch = Ht(n), this.namespace = r;
	}
	throwOnError() {
		return this.shouldThrowOnError = !0, this;
	}
	setHeader(e, t) {
		return this.headers = Bt(this.headers, e, t), this;
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
			if (Lt(e)) return {
				data: null,
				error: e
			};
			throw e;
		}
	}
}, nn = Symbol.toStringTag, rn = class {
	constructor(e, t) {
		this.downloadFn = e, this.shouldThrowOnError = t, this[nn] = "StreamDownloadBuilder", this.promise = null;
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
			if (Lt(t)) return {
				data: null,
				error: t
			};
			throw t;
		}
	}
}, an = Symbol.toStringTag, on = class {
	constructor(e, t) {
		this.downloadFn = e, this.shouldThrowOnError = t, this[an] = "BlobDownloadBuilder", this.promise = null;
	}
	asStream() {
		return new rn(this.downloadFn, this.shouldThrowOnError);
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
			if (Lt(t)) return {
				data: null,
				error: t
			};
			throw t;
		}
	}
}, sn = {
	limit: 100,
	offset: 0,
	sortBy: {
		column: "name",
		order: "asc"
	}
}, cn = {
	cacheControl: "3600",
	contentType: "text/plain;charset=UTF-8",
	upsert: !1
}, ln = class extends tn {
	constructor(e, t = {}, n, r) {
		super(e, t, r, "storage"), this.bucketId = n;
	}
	async uploadOrUpdate(e, t, n, r) {
		var i = this;
		return i.handleOperation(async () => {
			let a, o = T(T({}, cn), r), s = T(T({}, i.headers), e === "POST" && { "x-upsert": String(o.upsert) }), c = o.metadata;
			if (typeof Blob < "u" && n instanceof Blob ? (a = new FormData(), a.append("cacheControl", o.cacheControl), c && a.append("metadata", i.encodeMetadata(c)), a.append("", n)) : typeof FormData < "u" && n instanceof FormData ? (a = n, a.has("cacheControl") || a.append("cacheControl", o.cacheControl), c && !a.has("metadata") && a.append("metadata", i.encodeMetadata(c))) : (a = n, s["cache-control"] = `max-age=${o.cacheControl}`, s["content-type"] = o.contentType, c && (s["x-metadata"] = i.toBase64(i.encodeMetadata(c))), (typeof ReadableStream < "u" && a instanceof ReadableStream || a && typeof a == "object" && "pipe" in a && typeof a.pipe == "function") && !o.duplex && (o.duplex = "half")), r?.headers) for (let [e, t] of Object.entries(r.headers)) s = Bt(s, e, t);
			let l = i._removeEmptyFolders(t), u = i._getFinalPath(l), d = await (e == "PUT" ? Qt : E)(i.fetch, `${i.url}/object/${u}`, a, T({ headers: s }, o?.duplex ? { duplex: o.duplex } : {}));
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
			let e, t = T(T({}, cn), r), o = T(T({}, i.headers), { "x-upsert": String(t.upsert) }), c = t.metadata;
			if (typeof Blob < "u" && n instanceof Blob ? (e = new FormData(), e.append("cacheControl", t.cacheControl), c && e.append("metadata", i.encodeMetadata(c)), e.append("", n)) : typeof FormData < "u" && n instanceof FormData ? (e = n, e.has("cacheControl") || e.append("cacheControl", t.cacheControl), c && !e.has("metadata") && e.append("metadata", i.encodeMetadata(c))) : (e = n, o["cache-control"] = `max-age=${t.cacheControl}`, o["content-type"] = t.contentType, c && (o["x-metadata"] = i.toBase64(i.encodeMetadata(c))), (typeof ReadableStream < "u" && e instanceof ReadableStream || e && typeof e == "object" && "pipe" in e && typeof e.pipe == "function") && !t.duplex && (t.duplex = "half")), r?.headers) for (let [e, t] of Object.entries(r.headers)) o = Bt(o, e, t);
			return {
				path: a,
				fullPath: (await Qt(i.fetch, s.toString(), e, T({ headers: o }, t?.duplex ? { duplex: t.duplex } : {}))).Key
			};
		});
	}
	async createSignedUploadUrl(e, t) {
		var n = this;
		return n.handleOperation(async () => {
			let r = n._getFinalPath(e), i = T({}, n.headers);
			t?.upsert && (i["x-upsert"] = "true");
			let a = await E(n.fetch, `${n.url}/object/upload/sign/${r}`, {}, { headers: i }), o = new URL(n.url + a.url), s = o.searchParams.get("token");
			if (!s) throw new It("No token returned by API");
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
		return new on(() => Zt(this.fetch, `${this.url}/${r}/${o}${a ? `?${a}` : ""}`, {
			headers: this.headers,
			noResolveJson: !0
		}, n), this.shouldThrowOnError);
	}
	async info(e) {
		var t = this;
		let n = t._getFinalPath(e);
		return t.handleOperation(async () => Wt(await Zt(t.fetch, `${t.url}/object/info/${n}`, { headers: t.headers })));
	}
	async exists(e) {
		var t = this;
		let n = t._getFinalPath(e);
		try {
			return await $t(t.fetch, `${t.url}/object/${n}`, { headers: t.headers }), {
				data: !0,
				error: null
			};
		} catch (e) {
			if (t.shouldThrowOnError) throw e;
			if (Lt(e)) {
				let t = e instanceof Rt ? e.status : e instanceof zt ? e.originalError?.status : void 0;
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
		return t.handleOperation(async () => await en(t.fetch, `${t.url}/object/${t.bucketId}`, { prefixes: e }, { headers: t.headers }));
	}
	async purgeCache(e, t, n) {
		var r = this;
		return r.handleOperation(async () => {
			let i = r._getFinalPath(e), a = new URLSearchParams();
			t?.transformations && a.set("transformations", "true");
			let o = a.toString();
			return await en(r.fetch, `${r.url}/cdn/${i}${o ? `?${o}` : ""}`, {}, { headers: r.headers }, n);
		});
	}
	async list(e, t, n) {
		var r = this;
		return r.handleOperation(async () => {
			let i = t?.sortBy ? T(T({}, sn.sortBy), t.sortBy) : sn.sortBy, a = T(T(T({}, sn), t), {}, {
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
}, un = { "X-Client-Info": "storage-js/2.110.3" }, dn = class extends tn {
	constructor(e, t = {}, n, r) {
		let i = new URL(e);
		r?.useNewHostname && /supabase\.(co|in|red)$/.test(i.hostname) && !i.hostname.includes("storage.supabase.") && (i.hostname = i.hostname.replace("supabase.", "storage.supabase."));
		let a = i.href.replace(/\/$/, ""), o = T(T({}, un), t);
		super(a, o, n, "storage");
	}
	async listBuckets(e) {
		var t = this;
		return t.handleOperation(async () => {
			let n = t.listBucketOptionsToQueryString(e);
			return await Zt(t.fetch, `${t.url}/bucket${n}`, { headers: t.headers });
		});
	}
	async getBucket(e) {
		var t = this;
		return t.handleOperation(async () => await Zt(t.fetch, `${t.url}/bucket/${e}`, { headers: t.headers }));
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
		return n.handleOperation(async () => await Qt(n.fetch, `${n.url}/bucket/${e}`, {
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
		return t.handleOperation(async () => await en(t.fetch, `${t.url}/bucket/${e}`, {}, { headers: t.headers }));
	}
	async purgeBucketCache(e, t, n) {
		var r = this;
		return r.handleOperation(async () => {
			let i = new URLSearchParams();
			t?.transformations && i.set("transformations", "true");
			let a = i.toString();
			return await en(r.fetch, `${r.url}/cdn/${e}${a ? `?${a}` : ""}`, {}, { headers: r.headers }, n);
		});
	}
	listBucketOptionsToQueryString(e) {
		let t = {};
		return e && ("limit" in e && (t.limit = String(e.limit)), "offset" in e && (t.offset = String(e.offset)), e.search && (t.search = e.search), e.sortColumn && (t.sortColumn = e.sortColumn), e.sortOrder && (t.sortOrder = e.sortOrder)), Object.keys(t).length > 0 ? "?" + new URLSearchParams(t).toString() : "";
	}
}, fn = class extends tn {
	constructor(e, t = {}, n) {
		let r = e.replace(/\/$/, ""), i = T(T({}, un), t);
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
			return await Zt(t.fetch, i, { headers: t.headers });
		});
	}
	async deleteBucket(e) {
		var t = this;
		return t.handleOperation(async () => await en(t.fetch, `${t.url}/bucket/${e}`, {}, { headers: t.headers }));
	}
	from(e) {
		var t = this;
		if (!Gt(e)) throw new It("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
		let n = new At({
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
}, pn = class extends tn {
	constructor(e, t = {}, n) {
		let r = e.replace(/\/$/, ""), i = T(T({}, un), {}, { "Content-Type": "application/json" }, t);
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
}, mn = class extends tn {
	constructor(e, t = {}, n) {
		let r = e.replace(/\/$/, ""), i = T(T({}, un), {}, { "Content-Type": "application/json" }, t);
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
}, hn = class extends tn {
	constructor(e, t = {}, n) {
		let r = e.replace(/\/$/, ""), i = T(T({}, un), {}, { "Content-Type": "application/json" }, t);
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
}, gn = class extends hn {
	constructor(e, t = {}) {
		super(e, t.headers || {}, t.fetch);
	}
	from(e) {
		return new _n(this.url, this.headers, e, this.fetch);
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
}, _n = class extends pn {
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
		return new vn(this.url, this.headers, this.vectorBucketName, e, this.fetch);
	}
}, vn = class extends mn {
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
}, yn = class extends dn {
	constructor(e, t = {}, n, r) {
		super(e, t, n, r);
	}
	from(e) {
		return new ln(this.url, this.headers, e, this.fetch);
	}
	get vectors() {
		return new gn(this.url + "/vector", {
			headers: this.headers,
			fetch: this.fetch
		});
	}
	get analytics() {
		return new fn(this.url + "/iceberg", this.headers, this.fetch);
	}
}, bn = "2.110.3", xn = 30 * 1e3, Sn = 3 * xn, Cn = 2 * xn, wn = "http://localhost:9999", Tn = "supabase.auth.token", En = { "X-Client-Info": `gotrue-js/${bn}` }, Dn = "X-Supabase-Api-Version", On = { "2024-01-01": {
	timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
	name: "2024-01-01"
} }, kn = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i, An = class extends Error {
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
var jn = class extends An {
	constructor(e, t, n) {
		super(e, t, n), this.name = "AuthApiError", this.status = t, this.code = n;
	}
};
function Mn(e) {
	return O(e) && e.name === "AuthApiError";
}
var Nn = class extends An {
	constructor(e, t) {
		super(e), this.name = "AuthUnknownError", this.originalError = t;
	}
}, Pn = class extends An {
	constructor(e, t, n, r) {
		super(e, n, r), this.name = t, this.status = n;
	}
}, k = class extends Pn {
	constructor() {
		super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
	}
};
function Fn(e) {
	return O(e) && e.name === "AuthSessionMissingError";
}
var In = class extends Pn {
	constructor() {
		super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
	}
}, Ln = class extends Pn {
	constructor(e) {
		super(e, "AuthInvalidCredentialsError", 400, void 0);
	}
}, Rn = class extends Pn {
	constructor(e, t = null) {
		super(e, "AuthImplicitGrantRedirectError", 500, void 0), this.details = null, this.details = t;
	}
	toJSON() {
		return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
	}
};
function zn(e) {
	return O(e) && e.name === "AuthImplicitGrantRedirectError";
}
var Bn = class extends Pn {
	constructor(e, t = null) {
		super(e, "AuthPKCEGrantCodeExchangeError", 500, void 0), this.details = null, this.details = t;
	}
	toJSON() {
		return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
	}
}, Vn = class extends Pn {
	constructor() {
		super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.", "AuthPKCECodeVerifierMissingError", 400, "pkce_code_verifier_not_found");
	}
}, Hn = class extends Pn {
	constructor(e, t) {
		super(e, "AuthRetryableFetchError", t, void 0);
	}
};
function Un(e) {
	return O(e) && e.name === "AuthRetryableFetchError";
}
var Wn = class extends Pn {
	constructor(e = "Refresh result discarded: session state changed mid-flight (e.g., concurrent signOut)") {
		super(e, "AuthRefreshDiscardedError", 409, void 0);
	}
};
function Gn(e) {
	return O(e) && e.name === "AuthRefreshDiscardedError";
}
var Kn = class extends Pn {
	constructor(e, t, n) {
		super(e, "AuthWeakPasswordError", t, "weak_password"), this.reasons = n;
	}
	toJSON() {
		return Object.assign(Object.assign({}, super.toJSON()), { reasons: this.reasons });
	}
}, qn = class extends Pn {
	constructor(e) {
		super(e, "AuthInvalidJwtError", 400, "invalid_jwt");
	}
}, Jn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), Yn = " 	\n\r=".split(""), Xn = (() => {
	let e = Array(128);
	for (let t = 0; t < e.length; t += 1) e[t] = -1;
	for (let t = 0; t < Yn.length; t += 1) e[Yn[t].charCodeAt(0)] = -2;
	for (let t = 0; t < Jn.length; t += 1) e[Jn[t].charCodeAt(0)] = t;
	return e;
})();
function Zn(e, t, n) {
	if (e !== null) for (t.queue = t.queue << 8 | e, t.queuedBits += 8; t.queuedBits >= 6;) n(Jn[t.queue >> t.queuedBits - 6 & 63]), t.queuedBits -= 6;
	else if (t.queuedBits > 0) for (t.queue <<= 6 - t.queuedBits, t.queuedBits = 6; t.queuedBits >= 6;) n(Jn[t.queue >> t.queuedBits - 6 & 63]), t.queuedBits -= 6;
}
function Qn(e, t, n) {
	let r = Xn[e];
	if (r > -1) for (t.queue = t.queue << 6 | r, t.queuedBits += 6; t.queuedBits >= 8;) n(t.queue >> t.queuedBits - 8 & 255), t.queuedBits -= 8;
	else if (r === -2) return;
	else throw Error(`Invalid Base64-URL character "${String.fromCharCode(e)}"`);
}
function $n(e) {
	let t = [], n = (e) => {
		t.push(String.fromCodePoint(e));
	}, r = {
		utf8seq: 0,
		codepoint: 0
	}, i = {
		queue: 0,
		queuedBits: 0
	}, a = (e) => {
		nr(e, r, n);
	};
	for (let t = 0; t < e.length; t += 1) Qn(e.charCodeAt(t), i, a);
	return t.join("");
}
function er(e, t) {
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
function tr(e, t) {
	for (let n = 0; n < e.length; n += 1) {
		let r = e.charCodeAt(n);
		if (r > 55295 && r <= 56319) {
			let t = (r - 55296) * 1024 & 65535;
			r = (e.charCodeAt(n + 1) - 56320 & 65535 | t) + 65536, n += 1;
		}
		er(r, t);
	}
}
function nr(e, t, n) {
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
function rr(e) {
	let t = [], n = {
		queue: 0,
		queuedBits: 0
	}, r = (e) => {
		t.push(e);
	};
	for (let t = 0; t < e.length; t += 1) Qn(e.charCodeAt(t), n, r);
	return new Uint8Array(t);
}
function ir(e) {
	let t = [];
	return tr(e, (e) => t.push(e)), new Uint8Array(t);
}
function ar(e) {
	let t = [], n = {
		queue: 0,
		queuedBits: 0
	}, r = (e) => {
		t.push(e);
	};
	return e.forEach((e) => Zn(e, n, r)), Zn(null, n, r), t.join("");
}
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/helpers.js
function or(e) {
	return Math.round(Date.now() / 1e3) + e;
}
function sr() {
	return Symbol("auth-callback");
}
var A = () => typeof window < "u" && typeof document < "u", cr = {
	tested: !1,
	writable: !1
}, lr = () => {
	if (!A()) return !1;
	try {
		if (typeof globalThis.localStorage != "object") return !1;
	} catch {
		return !1;
	}
	if (cr.tested) return cr.writable;
	let e = `lswt-${Math.random()}${Math.random()}`;
	try {
		globalThis.localStorage.setItem(e, e), globalThis.localStorage.removeItem(e), cr.tested = !0, cr.writable = !0;
	} catch {
		cr.tested = !0, cr.writable = !1;
	}
	return cr.writable;
};
function ur(e) {
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
var dr = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), fr = (e) => typeof e == "object" && !!e && "status" in e && "ok" in e && "json" in e && typeof e.json == "function", pr = async (e, t, n) => {
	await e.setItem(t, JSON.stringify(n));
}, mr = async (e, t) => {
	let n = await e.getItem(t);
	if (!n) return null;
	try {
		return JSON.parse(n);
	} catch {
		return null;
	}
}, j = async (e, t) => {
	await e.removeItem(t);
}, hr = class e {
	constructor() {
		this.promise = new e.promiseConstructor((e, t) => {
			this.resolve = e, this.reject = t;
		});
	}
};
hr.promiseConstructor = Promise;
function gr(e) {
	let t = e.split(".");
	if (t.length !== 3) throw new qn("Invalid JWT structure");
	for (let e = 0; e < t.length; e++) if (!kn.test(t[e])) throw new qn("JWT not in base64url format");
	return {
		header: JSON.parse($n(t[0])),
		payload: JSON.parse($n(t[1])),
		signature: rr(t[2]),
		raw: {
			header: t[0],
			payload: t[1]
		}
	};
}
async function _r(e) {
	return await new Promise((t) => {
		setTimeout(() => t(null), e);
	});
}
function vr(e, t) {
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
function yr(e) {
	return ("0" + e.toString(16)).substr(-2);
}
function br() {
	let e = /* @__PURE__ */ new Uint32Array(56);
	if (typeof crypto > "u") {
		let e = "";
		for (let t = 0; t < 56; t++) e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~".charAt(Math.floor(Math.random() * 66));
		return e;
	}
	return crypto.getRandomValues(e), Array.from(e, yr).join("");
}
async function xr(e) {
	let t = new TextEncoder().encode(e), n = await crypto.subtle.digest("SHA-256", t), r = new Uint8Array(n);
	return Array.from(r).map((e) => String.fromCharCode(e)).join("");
}
async function Sr(e) {
	if (!(typeof crypto < "u" && crypto.subtle !== void 0 && typeof TextEncoder < "u")) return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), e;
	let t = await xr(e);
	return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function Cr(e, t, n = !1) {
	let r = br(), i = r;
	n && (i += "/recovery"), await pr(e, `${t}-code-verifier`, i);
	let a = await Sr(r);
	return [a, r === a ? "plain" : "s256"];
}
var wr = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function Tr(e) {
	let t = e.headers.get(Dn);
	if (!t || !t.match(wr)) return null;
	try {
		return /* @__PURE__ */ new Date(`${t}T00:00:00.0Z`);
	} catch {
		return null;
	}
}
function Er(e) {
	if (!e) throw Error("Missing exp claim");
	if (e <= Math.floor(Date.now() / 1e3)) throw Error("JWT has expired");
}
function Dr(e) {
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
var Or = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function kr(e) {
	if (!Or.test(e)) throw Error("@supabase/auth-js: Expected parameter to be UUID but is not");
}
function Ar(e) {
	if (!e.passkey) throw Error("@supabase/auth-js: the passkey API is experimental and disabled by default. Enable it by passing `auth: { experimental: { passkey: true } }` to createClient (or to the GoTrueClient constructor).");
}
function jr() {
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
function Mr(e, t) {
	return new Proxy(e, { get: (e, n, r) => {
		if (n === "__isInsecureUserWarningProxy") return !0;
		if (typeof n == "symbol") {
			let t = n.toString();
			if (t === "Symbol(Symbol.toPrimitive)" || t === "Symbol(Symbol.toStringTag)" || t === "Symbol(util.inspect.custom)" || t === "Symbol(nodejs.util.inspect.custom)") return Reflect.get(e, n, r);
		}
		return !t.value && typeof n == "string" && (console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."), t.value = !0), Reflect.get(e, n, r);
	} });
}
function Nr(e) {
	return JSON.parse(JSON.stringify(e));
}
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/fetch.js
var Pr = (e) => {
	if (typeof e == "object" && e) {
		let t = e;
		if (typeof t.msg == "string") return t.msg;
		if (typeof t.message == "string") return t.message;
		if (typeof t.error_description == "string") return t.error_description;
		if (typeof t.error == "string") return t.error;
	}
	return JSON.stringify(e);
}, Fr = [
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
async function Ir(e) {
	if (!fr(e)) throw new Hn(Pr(e), 0);
	if (Fr.includes(e.status)) throw new Hn(Pr(e), e.status);
	let t;
	try {
		t = await e.json();
	} catch (e) {
		throw new Nn(Pr(e), e);
	}
	let n, r = Tr(e);
	if (r && r.getTime() >= On["2024-01-01"].timestamp && typeof t == "object" && t && typeof t.code == "string" ? n = t.code : typeof t == "object" && t && typeof t.error_code == "string" && (n = t.error_code), !n) {
		if (typeof t == "object" && t && typeof t.weak_password == "object" && t.weak_password && Array.isArray(t.weak_password.reasons) && t.weak_password.reasons.length && t.weak_password.reasons.reduce((e, t) => e && typeof t == "string", !0)) throw new Kn(Pr(t), e.status, t.weak_password.reasons);
	} else if (n === "weak_password") throw new Kn(Pr(t), e.status, t.weak_password?.reasons || []);
	else if (n === "session_not_found") throw new k();
	throw new jn(Pr(t), e.status || 500, n);
}
var Lr = (e, t, n, r) => {
	let i = {
		method: e,
		headers: t?.headers || {}
	};
	return e === "GET" ? i : (i.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, t?.headers), i.body = JSON.stringify(r), Object.assign(Object.assign({}, i), n));
};
async function M(e, t, n, r) {
	let i = Object.assign({}, r?.headers);
	i["X-Supabase-Api-Version"] || (i[Dn] = On["2024-01-01"].name), r?.jwt && (i.Authorization = `Bearer ${r.jwt}`);
	let a = r?.query ?? {};
	r?.redirectTo && (a.redirect_to = r.redirectTo);
	let o = await Rr(e, t, n + (Object.keys(a).length ? "?" + new URLSearchParams(a).toString() : ""), {
		headers: i,
		noResolveJson: r?.noResolveJson
	}, {}, r?.body);
	return r?.xform ? r?.xform(o) : {
		data: Object.assign({}, o),
		error: null
	};
}
async function Rr(e, t, n, r, i, a) {
	let o = Lr(t, r, i, a), s;
	try {
		s = await e(n, Object.assign({}, o));
	} catch (e) {
		throw console.error(e), new Hn(Pr(e), 0);
	}
	if (s.ok || await Ir(s), r?.noResolveJson) return s;
	try {
		return await s.json();
	} catch (e) {
		await Ir(e);
	}
}
function N(e) {
	let t = null;
	Wr(e) && (t = Object.assign({}, e), e.expires_at || (t.expires_at = or(e.expires_in)));
	let n = e.user ?? (typeof e?.id == "string" ? e : null);
	return {
		data: {
			session: t,
			user: n
		},
		error: null
	};
}
function zr(e) {
	let t = N(e);
	return !t.error && e.weak_password && typeof e.weak_password == "object" && Array.isArray(e.weak_password.reasons) && e.weak_password.reasons.length && e.weak_password.message && typeof e.weak_password.message == "string" && e.weak_password.reasons.reduce((e, t) => e && typeof t == "string", !0) && (t.data.weak_password = e.weak_password), t;
}
function Br(e) {
	return {
		data: { user: e.user ?? e },
		error: null
	};
}
function Vr(e) {
	return {
		data: e,
		error: null
	};
}
function Hr(e) {
	let { action_link: n, email_otp: r, hashed_token: i, redirect_to: a, verification_type: o } = e, s = t(e, [
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
function Ur(e) {
	return e;
}
function Wr(e) {
	return !!e.access_token && !!e.refresh_token && !!e.expires_in;
}
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/types.js
var Gr = [
	"global",
	"local",
	"others"
], Kr = class {
	constructor({ url: e = "", headers: t = {}, fetch: n, experimental: r }) {
		this.url = e, this.headers = t, this.fetch = dr(n), this.experimental = r ?? {}, this.mfa = {
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
	async signOut(e, t = Gr[0]) {
		if (Gr.indexOf(t) < 0) throw Error(`@supabase/auth-js: Parameter scope must be one of ${Gr.join(", ")}`);
		try {
			return await M(this.fetch, "POST", `${this.url}/logout?scope=${t}`, {
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
			return await M(this.fetch, "POST", `${this.url}/invite`, {
				body: {
					email: e,
					data: t.data
				},
				headers: this.headers,
				redirectTo: t.redirectTo,
				xform: Br
			});
		} catch (e) {
			if (O(e)) return {
				data: { user: null },
				error: e
			};
			throw e;
		}
	}
	async generateLink(e) {
		try {
			let { options: n } = e, r = t(e, ["options"]), i = Object.assign(Object.assign({}, r), n);
			return "newEmail" in r && (i.new_email = r?.newEmail, delete i.newEmail), await M(this.fetch, "POST", `${this.url}/admin/generate_link`, {
				body: i,
				headers: this.headers,
				xform: Hr,
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
			return await M(this.fetch, "POST", `${this.url}/admin/users`, {
				body: e,
				headers: this.headers,
				xform: Br
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
			}, n = await M(this.fetch, "GET", `${this.url}/admin/users`, {
				headers: this.headers,
				noResolveJson: !0,
				query: {
					page: (e?.page)?.toString() ?? "",
					per_page: (e?.perPage)?.toString() ?? ""
				},
				xform: Ur
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
		kr(e);
		try {
			return await M(this.fetch, "GET", `${this.url}/admin/users/${e}`, {
				headers: this.headers,
				xform: Br
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
		kr(e);
		try {
			return await M(this.fetch, "PUT", `${this.url}/admin/users/${e}`, {
				body: t,
				headers: this.headers,
				xform: Br
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
		kr(e);
		try {
			return await M(this.fetch, "DELETE", `${this.url}/admin/users/${e}`, {
				headers: this.headers,
				body: { should_soft_delete: t },
				xform: Br
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
		kr(e.userId);
		try {
			let { data: t, error: n } = await M(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/factors`, {
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
		kr(e.userId), kr(e.id);
		try {
			return {
				data: await M(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/factors/${e.id}`, { headers: this.headers }),
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
			}, n = await M(this.fetch, "GET", `${this.url}/admin/oauth/clients`, {
				headers: this.headers,
				noResolveJson: !0,
				query: {
					page: (e?.page)?.toString() ?? "",
					per_page: (e?.perPage)?.toString() ?? ""
				},
				xform: Ur
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
			return await M(this.fetch, "POST", `${this.url}/admin/oauth/clients`, {
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
			return await M(this.fetch, "GET", `${this.url}/admin/oauth/clients/${e}`, {
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
			return await M(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${e}`, {
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
			return await M(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${e}`, {
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
			return await M(this.fetch, "POST", `${this.url}/admin/oauth/clients/${e}/regenerate_secret`, {
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
			return e?.type && (t.type = e.type), await M(this.fetch, "GET", `${this.url}/admin/custom-providers`, {
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
			return await M(this.fetch, "POST", `${this.url}/admin/custom-providers`, {
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
			return await M(this.fetch, "GET", `${this.url}/admin/custom-providers/${e}`, {
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
			return await M(this.fetch, "PUT", `${this.url}/admin/custom-providers/${e}`, {
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
			return await M(this.fetch, "DELETE", `${this.url}/admin/custom-providers/${e}`, {
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
		Ar(this.experimental), kr(e.userId);
		try {
			return await M(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/passkeys`, {
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
		Ar(this.experimental), kr(e.userId), kr(e.passkeyId);
		try {
			return await M(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/passkeys/${e.passkeyId}`, {
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
function qr(e = {}) {
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
globalThis && lr() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug");
var Jr = class extends Error {
	constructor(e) {
		super(e), this.isAcquireTimeout = !0;
	}
};
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/lib/polyfills.js
function Yr() {
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
function Xr(e) {
	if (!/^0x[a-fA-F0-9]{40}$/.test(e)) throw Error(`@supabase/auth-js: Address "${e}" is invalid.`);
	return e.toLowerCase();
}
function Zr(e) {
	return parseInt(e, 16);
}
function Qr(e) {
	let t = new TextEncoder().encode(e);
	return "0x" + Array.from(t, (e) => e.toString(16).padStart(2, "0")).join("");
}
function $r(e) {
	let { chainId: t, domain: n, expirationTime: r, issuedAt: i = /* @__PURE__ */ new Date(), nonce: a, notBefore: o, requestId: s, resources: c, scheme: l, uri: u, version: d } = e;
	if (!Number.isInteger(t)) throw Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${t}`);
	if (!n) throw Error("@supabase/auth-js: Invalid SIWE message field \"domain\". Domain must be provided.");
	if (a && a.length < 8) throw Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${a}`);
	if (!u) throw Error("@supabase/auth-js: Invalid SIWE message field \"uri\". URI must be provided.");
	if (d !== "1") throw Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${d}`);
	if (e.statement?.includes("\n")) throw Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${e.statement}`);
	let f = Xr(e.address), p = `${l ? `${l}://${n}` : n} wants you to sign in with your Ethereum account:\n${f}\n\n${e.statement ? `${e.statement}\n` : ""}`, m = `URI: ${u}\nVersion: ${d}\nChain ID: ${t}${a ? `\nNonce: ${a}` : ""}\nIssued At: ${i.toISOString()}`;
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
var P = class extends Error {
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
}, ei = class extends P {
	constructor(e, t) {
		super({
			code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
			cause: t,
			message: e
		}), this.name = "WebAuthnUnknownError", this.originalError = t;
	}
};
function ti({ error: e, options: t }) {
	let { publicKey: n } = t;
	if (!n) throw Error("options was missing required publicKey property");
	if (e.name === "AbortError") {
		if (t.signal instanceof AbortSignal) return new P({
			message: "Registration ceremony was sent an abort signal",
			code: "ERROR_CEREMONY_ABORTED",
			cause: e
		});
	} else if (e.name === "ConstraintError") {
		if (n.authenticatorSelection?.requireResidentKey === !0) return new P({
			message: "Discoverable credentials were required but no available authenticator supported it",
			code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
			cause: e
		});
		if (t.mediation === "conditional" && n.authenticatorSelection?.userVerification === "required") return new P({
			message: "User verification was required during automatic registration but it could not be performed",
			code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
			cause: e
		});
		if (n.authenticatorSelection?.userVerification === "required") return new P({
			message: "User verification was required but no available authenticator supported it",
			code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
			cause: e
		});
	} else if (e.name === "InvalidStateError") return new P({
		message: "The authenticator was previously registered",
		code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
		cause: e
	});
	else if (e.name === "NotAllowedError") return new P({
		message: e.message,
		code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
		cause: e
	});
	else if (e.name === "NotSupportedError") return n.pubKeyCredParams.filter((e) => e.type === "public-key").length === 0 ? new P({
		message: "No entry in pubKeyCredParams was of type \"public-key\"",
		code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
		cause: e
	}) : new P({
		message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
		code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
		cause: e
	});
	else if (e.name === "SecurityError") {
		let t = window.location.hostname;
		if (!ci(t)) return new P({
			message: `${window.location.hostname} is an invalid domain`,
			code: "ERROR_INVALID_DOMAIN",
			cause: e
		});
		if (n.rp.id !== t) return new P({
			message: `The RP ID "${n.rp.id}" is invalid for this domain`,
			code: "ERROR_INVALID_RP_ID",
			cause: e
		});
	} else if (e.name === "TypeError") {
		if (n.user.id.byteLength < 1 || n.user.id.byteLength > 64) return new P({
			message: "User ID was not between 1 and 64 characters",
			code: "ERROR_INVALID_USER_ID_LENGTH",
			cause: e
		});
	} else if (e.name === "UnknownError") return new P({
		message: "The authenticator was unable to process the specified options, or could not create a new credential",
		code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
		cause: e
	});
	return new P({
		message: "a Non-Webauthn related error has occurred",
		code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
		cause: e
	});
}
function ni({ error: e, options: t }) {
	let { publicKey: n } = t;
	if (!n) throw Error("options was missing required publicKey property");
	if (e.name === "AbortError") {
		if (t.signal instanceof AbortSignal) return new P({
			message: "Authentication ceremony was sent an abort signal",
			code: "ERROR_CEREMONY_ABORTED",
			cause: e
		});
	} else if (e.name === "NotAllowedError") return new P({
		message: e.message,
		code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
		cause: e
	});
	else if (e.name === "SecurityError") {
		let t = window.location.hostname;
		if (!ci(t)) return new P({
			message: `${window.location.hostname} is an invalid domain`,
			code: "ERROR_INVALID_DOMAIN",
			cause: e
		});
		if (n.rpId !== t) return new P({
			message: `The RP ID "${n.rpId}" is invalid for this domain`,
			code: "ERROR_INVALID_RP_ID",
			cause: e
		});
	} else if (e.name === "UnknownError") return new P({
		message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
		code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
		cause: e
	});
	return new P({
		message: "a Non-Webauthn related error has occurred",
		code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
		cause: e
	});
}
var ri = new class {
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
function ii(e) {
	if (!e) throw Error("Credential creation options are required");
	if (typeof PublicKeyCredential < "u" && "parseCreationOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON == "function") return PublicKeyCredential.parseCreationOptionsFromJSON(e);
	let { challenge: n, user: r, excludeCredentials: i } = e, a = t(e, [
		"challenge",
		"user",
		"excludeCredentials"
	]), o = rr(n).buffer, s = Object.assign(Object.assign({}, r), { id: rr(r.id).buffer }), c = Object.assign(Object.assign({}, a), {
		challenge: o,
		user: s
	});
	if (i && i.length > 0) {
		c.excludeCredentials = Array(i.length);
		for (let e = 0; e < i.length; e++) {
			let t = i[e];
			c.excludeCredentials[e] = Object.assign(Object.assign({}, t), {
				id: rr(t.id).buffer,
				type: t.type || "public-key",
				transports: t.transports
			});
		}
	}
	return c;
}
function ai(e) {
	if (!e) throw Error("Credential request options are required");
	if (typeof PublicKeyCredential < "u" && "parseRequestOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON == "function") return PublicKeyCredential.parseRequestOptionsFromJSON(e);
	let { challenge: n, allowCredentials: r } = e, i = t(e, ["challenge", "allowCredentials"]), a = rr(n).buffer, o = Object.assign(Object.assign({}, i), { challenge: a });
	if (r && r.length > 0) {
		o.allowCredentials = Array(r.length);
		for (let e = 0; e < r.length; e++) {
			let t = r[e];
			o.allowCredentials[e] = Object.assign(Object.assign({}, t), {
				id: rr(t.id).buffer,
				type: t.type || "public-key",
				transports: t.transports
			});
		}
	}
	return o;
}
function oi(e) {
	if ("toJSON" in e && typeof e.toJSON == "function") return e.toJSON();
	let t = e;
	return {
		id: e.id,
		rawId: e.id,
		response: {
			attestationObject: ar(new Uint8Array(e.response.attestationObject)),
			clientDataJSON: ar(new Uint8Array(e.response.clientDataJSON))
		},
		type: "public-key",
		clientExtensionResults: e.getClientExtensionResults(),
		authenticatorAttachment: t.authenticatorAttachment ?? void 0
	};
}
function si(e) {
	if ("toJSON" in e && typeof e.toJSON == "function") return e.toJSON();
	let t = e, n = e.getClientExtensionResults(), r = e.response;
	return {
		id: e.id,
		rawId: e.id,
		response: {
			authenticatorData: ar(new Uint8Array(r.authenticatorData)),
			clientDataJSON: ar(new Uint8Array(r.clientDataJSON)),
			signature: ar(new Uint8Array(r.signature)),
			userHandle: r.userHandle ? ar(new Uint8Array(r.userHandle)) : void 0
		},
		type: "public-key",
		clientExtensionResults: n,
		authenticatorAttachment: t.authenticatorAttachment ?? void 0
	};
}
function ci(e) {
	return e === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(e);
}
function li() {
	return !!(A() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && typeof (navigator == null ? void 0 : navigator.credentials)?.create == "function" && typeof (navigator == null ? void 0 : navigator.credentials)?.get == "function");
}
async function ui(e) {
	try {
		let t = await navigator.credentials.create(e);
		return t ? t instanceof PublicKeyCredential ? {
			data: t,
			error: null
		} : {
			data: null,
			error: new ei("Browser returned unexpected credential type", t)
		} : {
			data: null,
			error: new ei("Empty credential response", t)
		};
	} catch (t) {
		return {
			data: null,
			error: ti({
				error: t,
				options: e
			})
		};
	}
}
async function di(e) {
	try {
		let t = await navigator.credentials.get(e);
		return t ? t instanceof PublicKeyCredential ? {
			data: t,
			error: null
		} : {
			data: null,
			error: new ei("Browser returned unexpected credential type", t)
		} : {
			data: null,
			error: new ei("Empty credential response", t)
		};
	} catch (t) {
		return {
			data: null,
			error: ni({
				error: t,
				options: e
			})
		};
	}
}
var fi = {
	hints: ["security-key"],
	authenticatorSelection: {
		authenticatorAttachment: "cross-platform",
		requireResidentKey: !1,
		userVerification: "preferred",
		residentKey: "discouraged"
	},
	attestation: "direct"
}, pi = {
	userVerification: "preferred",
	hints: ["security-key"],
	attestation: "direct"
};
function mi(...e) {
	let t = (e) => typeof e == "object" && !!e && !Array.isArray(e), n = (e) => e instanceof ArrayBuffer || ArrayBuffer.isView(e), r = {};
	for (let i of e) if (i) for (let e in i) {
		let a = i[e];
		if (a !== void 0) if (Array.isArray(a)) r[e] = a;
		else if (n(a)) r[e] = a;
		else if (t(a)) {
			let n = r[e];
			t(n) ? r[e] = mi(n, a) : r[e] = mi(a);
		} else r[e] = a;
	}
	return r;
}
function hi(e, t) {
	return mi(fi, e, t || {});
}
function gi(e, t) {
	return mi(pi, e, t || {});
}
var _i = class {
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
			let s = r ?? ri.createNewAbortSignal();
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
					let { data: t, error: n } = await ui({
						publicKey: hi(a.webauthn.credential_options.publicKey, i?.create),
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
					let t = gi(a.webauthn.credential_options.publicKey, i?.request), { data: n, error: r } = await di(Object.assign(Object.assign({}, a.webauthn.credential_options), {
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
				error: new Nn("Unexpected error in challenge", e)
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
			error: new An("rpId is required for WebAuthn authentication")
		};
		try {
			if (!li()) return {
				data: null,
				error: new Nn("Browser does not support WebAuthn", null)
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
				error: new Nn("Unexpected error in authenticate", e)
			};
		}
	}
	async _register({ friendlyName: e, webauthn: { rpId: t = typeof window < "u" ? window.location.hostname : void 0, rpOrigins: n = typeof window < "u" ? [window.location.origin] : void 0, signal: r } = {} }, i) {
		if (!t) return {
			data: null,
			error: new An("rpId is required for WebAuthn registration")
		};
		try {
			if (!li()) return {
				data: null,
				error: new Nn("Browser does not support WebAuthn", null)
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
				error: new Nn("Unexpected error in register", e)
			};
		}
	}
};
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/GoTrueClient.js
Yr();
var vi = {
	url: wn,
	storageKey: Tn,
	autoRefreshToken: !0,
	persistSession: !0,
	detectSessionInUrl: !0,
	headers: En,
	flowType: "implicit",
	debug: !1,
	hasCustomAuthorizationHeader: !1,
	throwOnError: !1,
	lockAcquireTimeout: 5e3,
	skipAutoInitialize: !1,
	experimental: {}
}, yi = {}, bi = class e {
	get jwks() {
		return yi[this.storageKey]?.jwks ?? { keys: [] };
	}
	set jwks(e) {
		yi[this.storageKey] = Object.assign(Object.assign({}, yi[this.storageKey]), { jwks: e });
	}
	get jwks_cached_at() {
		return yi[this.storageKey]?.cachedAt ?? -(2 ** 53 - 1);
	}
	set jwks_cached_at(e) {
		yi[this.storageKey] = Object.assign(Object.assign({}, yi[this.storageKey]), { cachedAt: e });
	}
	constructor(t) {
		var n;
		this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.autoRefreshTickTimeout = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.lastRefreshFailure = null, this._sessionRemovalEpoch = 0, this.initializePromise = null, this._pendingInitNotifications = null, this.detectSessionInUrl = !0, this.hasCustomAuthorizationHeader = !1, this.suppressGetSessionWarning = !1, this.lock = null, this.lockAcquired = !1, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log;
		let r = Object.assign(Object.assign({}, vi), t);
		if (this.storageKey = r.storageKey, this.instanceID = e.nextInstanceID[this.storageKey] ?? 0, e.nextInstanceID[this.storageKey] = this.instanceID + 1, this.logDebugMessages = !!r.debug, typeof r.debug == "function" && (this.logger = r.debug), this.instanceID > 0 && A()) {
			let e = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
			console.warn(e), this.logDebugMessages && console.trace(e);
		}
		if (this.persistSession = r.persistSession, this.autoRefreshToken = r.autoRefreshToken, this.experimental = r.experimental ?? {}, this.admin = new Kr({
			url: r.url,
			headers: r.headers,
			fetch: r.fetch,
			experimental: this.experimental
		}), this.url = r.url, this.headers = r.headers, this.fetch = dr(r.fetch), this.detectSessionInUrl = r.detectSessionInUrl, this.flowType = r.flowType, this.hasCustomAuthorizationHeader = r.hasCustomAuthorizationHeader, this.throwOnError = r.throwOnError, this.lockAcquireTimeout = r.lockAcquireTimeout, r.lock != null && (this.lock = r.lock), this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = -(2 ** 53 - 1)), this.mfa = {
			verify: this._verify.bind(this),
			enroll: this._enroll.bind(this),
			unenroll: this._unenroll.bind(this),
			challenge: this._challenge.bind(this),
			listFactors: this._listFactors.bind(this),
			challengeAndVerify: this._challengeAndVerify.bind(this),
			getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
			webauthn: new _i(this)
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
		}, this.persistSession ? (r.storage ? this.storage = r.storage : lr() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = qr(this.memoryStorage)), r.userStorage && (this.userStorage = r.userStorage)) : (this.memoryStorage = {}, this.storage = qr(this.memoryStorage)), A() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
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
		return `GoTrueClient@${this.storageKey}:${this.instanceID} (${bn}) ${(/* @__PURE__ */ new Date()).toISOString()}`;
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
			if (A() && (e = ur(window.location.href), this._isImplicitGrantCallback(e) ? t = "implicit" : await this._isPKCECallback(e) && (t = "pkce")), A() && this.detectSessionInUrl && t !== "none") {
				let { data: n, error: r } = await this._getSessionFromURL(e, t);
				if (r) {
					if (this._debug("#_initialize()", "error detecting session from URL", r), zn(r)) {
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
			return O(e) ? this._returnResult({ error: e }) : this._returnResult({ error: new Nn("Unexpected error during initialization", e) });
		} finally {
			await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
		}
	}
	async signInAnonymously(e) {
		try {
			let { data: t, error: n } = await M(this.fetch, "POST", `${this.url}/signup`, {
				headers: this.headers,
				body: {
					data: e?.options?.data ?? {},
					gotrue_meta_security: { captcha_token: e?.options?.captchaToken }
				},
				xform: N
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
				this.flowType === "pkce" && ([a, o] = await Cr(this.storage, this.storageKey)), t = await M(this.fetch, "POST", `${this.url}/signup`, {
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
					xform: N
				});
			} else if ("phone" in e) {
				let { phone: n, password: r, options: i } = e;
				t = await M(this.fetch, "POST", `${this.url}/signup`, {
					headers: this.headers,
					body: {
						phone: n,
						password: r,
						data: i?.data ?? {},
						channel: i?.channel ?? "sms",
						gotrue_meta_security: { captcha_token: i?.captchaToken }
					},
					xform: N
				});
			} else throw new Ln("You must provide either an email or phone number and a password");
			let { data: n, error: r } = t;
			if (r || !n) return await j(this.storage, `${this.storageKey}-code-verifier`), this._returnResult({
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
			if (await j(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
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
				t = await M(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
					headers: this.headers,
					body: {
						email: n,
						password: r,
						gotrue_meta_security: { captcha_token: i?.captchaToken }
					},
					xform: zr
				});
			} else if ("phone" in e) {
				let { phone: n, password: r, options: i } = e;
				t = await M(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
					headers: this.headers,
					body: {
						phone: n,
						password: r,
						gotrue_meta_security: { captcha_token: i?.captchaToken }
					},
					xform: zr
				});
			} else throw new Ln("You must provide either an email or phone number and a password");
			let { data: n, error: r } = t;
			if (r) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: r
			});
			if (!n || !n.session || !n.user) {
				let e = new In();
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
			if (!A()) {
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
			let u = Xr(l[0]), d = o?.signInWithEthereum?.chainId;
			d ||= Zr(await s.request({ method: "eth_chainId" })), t = $r({
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
				params: [Qr(t), u]
			});
		}
		try {
			let { data: r, error: i } = await M(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
				headers: this.headers,
				body: Object.assign({
					chain: "ethereum",
					message: t,
					signature: n
				}, e.options?.captchaToken ? { gotrue_meta_security: { captcha_token: e.options?.captchaToken } } : null),
				xform: N
			});
			if (i) throw i;
			if (!r || !r.session || !r.user) {
				let e = new In();
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
			if (!A()) {
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
			let { data: r, error: i } = await M(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
				headers: this.headers,
				body: Object.assign({
					chain: "solana",
					message: t,
					signature: ar(n)
				}, e.options?.captchaToken ? { gotrue_meta_security: { captcha_token: e.options?.captchaToken } } : null),
				xform: N
			});
			if (i) throw i;
			if (!r || !r.session || !r.user) {
				let e = new In();
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
		let [t, n] = (await mr(this.storage, `${this.storageKey}-code-verifier`) ?? "").split("/");
		try {
			if (!t && this.flowType === "pkce") throw new Vn();
			let { data: r, error: i } = await M(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
				headers: this.headers,
				body: {
					auth_code: e,
					code_verifier: t
				},
				xform: N
			});
			if (await j(this.storage, `${this.storageKey}-code-verifier`), i) throw i;
			if (!r || !r.session || !r.user) {
				let e = new In();
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
			if (await j(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
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
			let { options: t, provider: n, token: r, access_token: i, nonce: a } = e, { data: o, error: s } = await M(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
				headers: this.headers,
				body: {
					provider: n,
					id_token: r,
					access_token: i,
					nonce: a,
					gotrue_meta_security: { captcha_token: t?.captchaToken }
				},
				xform: N
			});
			if (s) return this._returnResult({
				data: {
					user: null,
					session: null
				},
				error: s
			});
			if (!o || !o.session || !o.user) {
				let e = new In();
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
				this.flowType === "pkce" && ([r, i] = await Cr(this.storage, this.storageKey));
				let { error: a } = await M(this.fetch, "POST", `${this.url}/otp`, {
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
				let { phone: t, options: n } = e, { data: r, error: i } = await M(this.fetch, "POST", `${this.url}/otp`, {
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
			throw new Ln("You must provide either an email or phone number.");
		} catch (e) {
			if (await j(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
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
			let { data: r, error: i } = await M(this.fetch, "POST", `${this.url}/verify`, {
				headers: this.headers,
				body: Object.assign(Object.assign({}, e), { gotrue_meta_security: { captcha_token: n } }),
				redirectTo: t,
				xform: N
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
			this.flowType === "pkce" && ([t, n] = await Cr(this.storage, this.storageKey));
			let r = await M(this.fetch, "POST", `${this.url}/sso`, {
				body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in e ? { provider_id: e.providerId } : null), "domain" in e ? { domain: e.domain } : null), { redirect_to: e.options?.redirectTo ?? void 0 }), e?.options?.captchaToken ? { gotrue_meta_security: { captcha_token: e.options.captchaToken } } : null), {
					skip_http_redirect: !0,
					code_challenge: t,
					code_challenge_method: n
				}),
				headers: this.headers,
				xform: Vr
			});
			return r.data?.url && A() && !e.options?.skipBrowserRedirect && window.location.assign(r.data.url), this._returnResult(r);
		} catch (e) {
			if (await j(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
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
				if (!t) throw new k();
				let { error: r } = await M(this.fetch, "GET", `${this.url}/reauthenticate`, {
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
				this.flowType === "pkce" && ([a, o] = await Cr(this.storage, this.storageKey));
				let { error: s } = await M(this.fetch, "POST", t, {
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
				return s && await j(this.storage, `${this.storageKey}-code-verifier`), this._returnResult({
					data: {
						user: null,
						session: null
					},
					error: s
				});
			} else if ("phone" in e) {
				let { phone: n, type: r, options: i } = e, { data: a, error: o } = await M(this.fetch, "POST", t, {
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
			throw new Ln("You must provide either an email or phone number and a type");
		} catch (e) {
			if (await j(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
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
			let e = null, t = await mr(this.storage, this.storageKey);
			if (this._debug("#getSession()", "session from storage", t), t !== null && (this._isValidSession(t) ? e = t : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !e) return {
				data: { session: null },
				error: null
			};
			let n = e.expires_at ? e.expires_at * 1e3 - Date.now() < Sn : !1;
			if (this._debug("#__loadSession()", `session has${n ? "" : " not"} expired`, "expires_at", e.expires_at), !n) {
				if (this.userStorage) {
					let t = await mr(this.userStorage, this.storageKey + "-user");
					t?.user ? e.user = t.user : e.user = jr();
				}
				if (this.storage.isServer && e.user && !e.user.__isUserNotAvailableProxy) {
					let t = { value: this.suppressGetSessionWarning };
					e.user = Mr(e.user, t), t.value && (this.suppressGetSessionWarning = !0);
				}
				return {
					data: { session: e },
					error: null
				};
			}
			let { data: r, error: i } = await this._callRefreshToken(e.refresh_token);
			if (i) {
				if (e.expires_at && e.expires_at * 1e3 > Date.now()) {
					let t = await mr(this.storage, this.storageKey);
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
			return e ? await M(this.fetch, "GET", `${this.url}/user`, {
				headers: this.headers,
				jwt: e,
				xform: Br
			}) : await this._useSession(async (e) => {
				let { data: t, error: n } = e;
				if (n) throw n;
				return !t.session?.access_token && !this.hasCustomAuthorizationHeader ? {
					data: { user: null },
					error: new k()
				} : await M(this.fetch, "GET", `${this.url}/user`, {
					headers: this.headers,
					jwt: t.session?.access_token ?? void 0,
					xform: Br
				});
			});
		} catch (e) {
			if (O(e)) return Fn(e) && (await this._removeSession(), await j(this.storage, `${this.storageKey}-code-verifier`)), this._returnResult({
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
				if (!r.session) throw new k();
				let a = r.session, o = null, s = null;
				this.flowType === "pkce" && e.email != null && ([o, s] = await Cr(this.storage, this.storageKey));
				let { data: c, error: l } = await M(this.fetch, "PUT", `${this.url}/user`, {
					headers: this.headers,
					redirectTo: t?.emailRedirectTo,
					body: Object.assign(Object.assign({}, e), {
						code_challenge: o,
						code_challenge_method: s
					}),
					jwt: a.access_token,
					xform: Br
				});
				if (l) throw l;
				return a.user = c.user, await this._saveSession(a), await this._notifyAllSubscribers("USER_UPDATED", a), this._returnResult({
					data: { user: a.user },
					error: null
				});
			});
		} catch (e) {
			if (await j(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
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
			if (!e.access_token || !e.refresh_token) throw new k();
			let t = Date.now() / 1e3, n = t, r = !0, i = null, { payload: a } = gr(e.access_token);
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
				if (!e?.refresh_token) throw new k();
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
			if (!A()) throw new Rn("No browser detected.");
			if (e.error || e.error_description || e.error_code) throw new Rn(e.error_description || "Error in URL with unspecified error_description", {
				error: e.error || "unspecified_error",
				code: e.error_code || "unspecified_code"
			});
			switch (t) {
				case "implicit":
					if (this.flowType === "pkce") throw new Bn("Not a valid PKCE flow url.");
					break;
				case "pkce":
					if (this.flowType === "implicit") throw new Rn("Not a valid implicit grant flow url.");
					break;
				default:
			}
			if (t === "pkce") {
				if (this._debug("#_initialize()", "begin", "is PKCE flow", !0), !e.code) throw new Bn("No code detected.");
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
			if (!i || !o || !a || !c) throw new Rn("No session defined in URL");
			let l = Math.round(Date.now() / 1e3), u = parseInt(o), d = l + u;
			s && (d = parseInt(s));
			let f = d - l;
			f * 1e3 <= 3e4 && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${f}s, should have been closer to ${u}s`);
			let p = d - u;
			l - p >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", p, d, l) : l - p < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", p, d, l);
			let { data: m, error: h } = await this._getUser(i);
			if (h) throw h;
			let g = {
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
					session: g,
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
		let t = await mr(this.storage, `${this.storageKey}-code-verifier`);
		return !!(e.code && t);
	}
	async signOut(e = { scope: "global" }) {
		return await this.initializePromise, this.lock == null ? await this._signOut(e) : await this._acquireLock(this.lockAcquireTimeout, async () => await this._signOut(e));
	}
	async _signOut({ scope: e } = { scope: "global" }) {
		return await this._useSession(async (t) => {
			let n = async () => {
				await this._removeSession(), await j(this.storage, `${this.storageKey}-code-verifier`);
			}, { data: r, error: i } = t;
			if (i && !Fn(i)) return this._returnResult({ error: i });
			let a = r.session?.access_token;
			if (a) {
				let { error: t } = await this.admin.signOut(a, e);
				if (t && !(Mn(t) && (t.status === 404 || t.status === 401 || t.status === 403) || Fn(t))) return e !== "others" && await n(), this._returnResult({ error: t });
			}
			return e !== "others" && await n(), this._returnResult({ error: null });
		});
	}
	onAuthStateChange(e) {
		let t = sr(), n = {
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
				await this.stateChangeEmitters.get(e)?.callback("INITIAL_SESSION", null), this._debug("INITIAL_SESSION", "callback id", e, "error", t), Fn(t) ? console.warn(t) : console.error(t);
			}
		});
	}
	async resetPasswordForEmail(e, t = {}) {
		let n = null, r = null;
		this.flowType === "pkce" && ([n, r] = await Cr(this.storage, this.storageKey, !0));
		try {
			return await M(this.fetch, "POST", `${this.url}/recover`, {
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
			if (await j(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
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
				return await M(this.fetch, "GET", i, {
					headers: this.headers,
					jwt: n.session?.access_token ?? void 0
				});
			});
			if (n) throw n;
			return A() && !e.options?.skipBrowserRedirect && window.location.assign(t?.url), this._returnResult({
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
				let { options: i, provider: a, token: o, access_token: s, nonce: c } = e, { data: l, error: u } = await M(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
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
					xform: N
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
					error: new In()
				}) : (l.session && (await this._saveSession(l.session), await this._notifyAllSubscribers("USER_UPDATED", l.session)), this._returnResult({
					data: l,
					error: u
				}));
			} catch (e) {
				if (await j(this.storage, `${this.storageKey}-code-verifier`), O(e)) return this._returnResult({
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
				return await M(this.fetch, "DELETE", `${this.url}/user/identities/${e.identity_id}`, {
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
			return await vr(async (n) => (n > 0 && await _r(200 * 2 ** (n - 1)), this._debug(t, "refreshing attempt", n), await M(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
				body: { refresh_token: e },
				headers: this.headers,
				xform: N
			})), (e, t) => {
				let r = 200 * 2 ** e;
				return t && Un(t) && Date.now() + r - n < 3e4;
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
		return this._debug("#_handleProviderSignIn()", "provider", e, "options", t, "url", n), A() && !t.skipBrowserRedirect && window.location.assign(n), {
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
			let t = await mr(this.storage, this.storageKey);
			if (t && this.userStorage) {
				let e = await mr(this.userStorage, this.storageKey + "-user");
				!this.storage.isServer && Object.is(this.storage, this.userStorage) && !e && (e = { user: t.user }, await pr(this.userStorage, this.storageKey + "-user", e)), t.user = e?.user ?? jr();
			} else if (t && !t.user && !t.user) {
				let e = await mr(this.storage, this.storageKey + "-user");
				e && e?.user ? (t.user = e.user, await j(this.storage, this.storageKey + "-user"), await pr(this.storage, this.storageKey, t)) : t.user = jr();
			}
			if (this._debug(e, "session from storage", t), !this._isValidSession(t)) {
				this._debug(e, "session is not valid"), t !== null && await this._removeSession();
				return;
			}
			let n = (t.expires_at ?? Infinity) * 1e3 - Date.now() < Sn;
			if (this._debug(e, `session has${n ? "" : " not"} expired with margin of ${Sn}s`), n) {
				if (this.autoRefreshToken && t.refresh_token) {
					let { error: n } = await this._callRefreshToken(t.refresh_token);
					n && (Gn(n) ? this._debug(e, "refresh discarded by commit guard", n) : this._debug(e, "refresh failed", n));
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
		if (!e) throw new k();
		if (this.refreshingDeferred) return this.refreshingDeferred.promise;
		if (this.lastRefreshFailure && this.lastRefreshFailure.refreshToken === e && Date.now() < this.lastRefreshFailure.expiresAt) return this._debug("#_callRefreshToken()", "returning cached failure (cooldown active)"), this.lastRefreshFailure.result;
		let r = "#_callRefreshToken()";
		this._debug(r, "begin");
		try {
			this.refreshingDeferred = new hr();
			let t = await mr(this.storage, this.storageKey), { data: n, error: i } = await this._refreshAccessToken(e);
			if (i) throw i;
			if (!n.session) throw new k();
			let a = await mr(this.storage, this.storageKey);
			if (t !== null && (a === null || a.refresh_token !== t.refresh_token)) {
				this._debug(r, "commit guard: storage changed since refresh started, discarding rotated tokens", {
					startedWith: "present",
					nowHolds: a ? "replaced" : "cleared"
				});
				let e = {
					data: null,
					error: new Wn()
				};
				return this.refreshingDeferred.resolve(e), e;
			}
			let o = this._sessionRemovalEpoch;
			if (await this._saveSession(n.session), this._sessionRemovalEpoch !== o) {
				this._debug(r, "commit guard (post-save): _removeSession ran during _saveSession, undoing write"), await j(this.storage, this.storageKey), this.userStorage && await j(this.userStorage, this.storageKey + "-user");
				let e = {
					data: null,
					error: new Wn()
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
				if (!Un(i)) {
					let e = await mr(this.storage, this.storageKey);
					e?.expires_at && e.expires_at * 1e3 > Date.now() ? this._debug(r, "proactive refresh failed, access token still valid — preserving session") : await this._removeSession();
				}
				return this.lastRefreshFailure = {
					refreshToken: e,
					result: n,
					expiresAt: Date.now() + Cn
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
			!n && t.user && await pr(this.userStorage, this.storageKey + "-user", { user: t.user });
			let e = Object.assign({}, t);
			delete e.user;
			let r = Nr(e);
			await pr(this.storage, this.storageKey, r);
		} else {
			let e = Nr(t);
			await pr(this.storage, this.storageKey, e);
		}
	}
	async _removeSession() {
		this._sessionRemovalEpoch += 1, this._debug("#_removeSession()"), this.lastRefreshFailure = null, this.suppressGetSessionWarning = !1, await j(this.storage, this.storageKey), await j(this.storage, this.storageKey + "-code-verifier"), await j(this.storage, this.storageKey + "-user"), this.userStorage && await j(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
	}
	_removeVisibilityChangedCallback() {
		this._debug("#_removeVisibilityChangedCallback()");
		let e = this.visibilityChangedCallback;
		this.visibilityChangedCallback = null;
		try {
			e && A() && window != null && window.removeEventListener && window.removeEventListener("visibilitychange", e);
		} catch (e) {
			console.error("removing visibilitychange callback failed", e);
		}
	}
	async _startAutoRefresh() {
		await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()");
		let e = setInterval(() => this._autoRefreshTokenTick(), xn);
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
								let r = Math.floor((n.expires_at * 1e3 - e) / xn);
								this._debug("#_autoRefreshTokenTick()", `access token expires in ${r} ticks, a tick lasts ${xn}ms, refresh threshold is 3 ticks`), r <= 3 && await this._callRefreshToken(n.refresh_token);
							});
						} catch (e) {
							console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
						}
					} finally {
						this._debug("#_autoRefreshTokenTick()", "end");
					}
				});
			} catch (e) {
				if (e instanceof Jr) this._debug("auto refresh token tick lock not available");
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
					let r = Math.floor((n.expires_at * 1e3 - e) / xn);
					this._debug("#_autoRefreshTokenTick()", `access token expires in ${r} ticks, a tick lasts ${xn}ms, refresh threshold is 3 ticks`), r <= 3 && await this._callRefreshToken(n.refresh_token);
				});
			} catch (e) {
				console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
			}
		} finally {
			this._debug("#_autoRefreshTokenTick()", "end");
		}
	}
	async _handleVisibilityChange() {
		if (this._debug("#_handleVisibilityChange()"), !A() || !(window != null && window.addEventListener)) return this.autoRefreshToken && this.startAutoRefresh(), !1;
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
			let [e, t] = await Cr(this.storage, this.storageKey), n = new URLSearchParams({
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
				}) : await M(this.fetch, "DELETE", `${this.url}/factors/${e.factorId}`, {
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
				}, e.factorType === "phone" ? { phone: e.phone } : e.factorType === "totp" ? { issuer: e.issuer } : {}), { data: a, error: o } = await M(this.fetch, "POST", `${this.url}/factors`, {
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
					let i = Object.assign({ challenge_id: e.challengeId }, "webauthn" in e ? { webauthn: Object.assign(Object.assign({}, e.webauthn), { credential_response: e.webauthn.type === "create" ? oi(e.webauthn.credential_response) : si(e.webauthn.credential_response) }) } : { code: e.code }), { data: a, error: o } = await M(this.fetch, "POST", `${this.url}/factors/${e.factorId}/verify`, {
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
					let i = await M(this.fetch, "POST", `${this.url}/factors/${e.factorId}/challenge`, {
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
							data: Object.assign(Object.assign({}, a), { webauthn: Object.assign(Object.assign({}, a.webauthn), { credential_options: Object.assign(Object.assign({}, a.webauthn.credential_options), { publicKey: ii(a.webauthn.credential_options.publicKey) }) }) }),
							error: null
						};
						case "request": return {
							data: Object.assign(Object.assign({}, a), { webauthn: Object.assign(Object.assign({}, a.webauthn), { credential_options: Object.assign(Object.assign({}, a.webauthn.credential_options), { publicKey: ai(a.webauthn.credential_options.publicKey) }) }) }),
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
			let { payload: t } = gr(e), n = null;
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
		let { payload: r } = gr(t.access_token), i = null;
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
				}) : n ? await M(this.fetch, "GET", `${this.url}/oauth/authorizations/${e}`, {
					headers: this.headers,
					jwt: n.access_token,
					xform: (e) => ({
						data: e,
						error: null
					})
				}) : this._returnResult({
					data: null,
					error: new k()
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
					error: new k()
				});
				let a = await M(this.fetch, "POST", `${this.url}/oauth/authorizations/${e}/consent`, {
					headers: this.headers,
					jwt: r.access_token,
					body: { action: "approve" },
					xform: (e) => ({
						data: e,
						error: null
					})
				});
				return a.data && a.data.redirect_url && A() && !t?.skipBrowserRedirect && window.location.assign(a.data.redirect_url), a;
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
					error: new k()
				});
				let a = await M(this.fetch, "POST", `${this.url}/oauth/authorizations/${e}/consent`, {
					headers: this.headers,
					jwt: r.access_token,
					body: { action: "deny" },
					xform: (e) => ({
						data: e,
						error: null
					})
				});
				return a.data && a.data.redirect_url && A() && !t?.skipBrowserRedirect && window.location.assign(a.data.redirect_url), a;
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
				}) : t ? await M(this.fetch, "GET", `${this.url}/user/oauth/grants`, {
					headers: this.headers,
					jwt: t.access_token,
					xform: (e) => ({
						data: e,
						error: null
					})
				}) : this._returnResult({
					data: null,
					error: new k()
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
				}) : n ? (await M(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, {
					headers: this.headers,
					jwt: n.access_token,
					query: { client_id: e.clientId },
					noResolveJson: !0
				}), {
					data: {},
					error: null
				}) : this._returnResult({
					data: null,
					error: new k()
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
		let { data: i, error: a } = await M(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, { headers: this.headers });
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
			let { header: r, payload: i, signature: a, raw: { header: o, payload: s } } = gr(n);
			if (!t?.allowExpired) try {
				Er(i.exp);
			} catch (e) {
				throw new qn(e instanceof Error ? e.message : "JWT validation failed");
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
			let l = Dr(r.alg), u = await crypto.subtle.importKey("jwk", c, l, !0, ["verify"]);
			if (!await crypto.subtle.verify(l, u, a, ir(`${o}.${s}`))) throw new qn("Invalid JWT signature");
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
		Ar(this.experimental);
		try {
			if (!li()) return this._returnResult({
				data: null,
				error: new Nn("Browser does not support WebAuthn", null)
			});
			let { data: t, error: n } = await this._startPasskeyAuthentication({ options: { captchaToken: e?.options?.captchaToken } });
			if (n || !t) return this._returnResult({
				data: null,
				error: n
			});
			let { data: r, error: i } = await di({
				publicKey: ai(t.options),
				signal: e?.options?.signal ?? ri.createNewAbortSignal()
			});
			if (i || !r) return this._returnResult({
				data: null,
				error: i ?? new Nn("WebAuthn ceremony failed", null)
			});
			let a = si(r);
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
		Ar(this.experimental);
		try {
			if (!li()) return this._returnResult({
				data: null,
				error: new Nn("Browser does not support WebAuthn", null)
			});
			let { data: t, error: n } = await this._startPasskeyRegistration();
			if (n || !t) return this._returnResult({
				data: null,
				error: n
			});
			let { data: r, error: i } = await ui({
				publicKey: ii(t.options),
				signal: e?.options?.signal ?? ri.createNewAbortSignal()
			});
			if (i || !r) return this._returnResult({
				data: null,
				error: i ?? new Nn("WebAuthn ceremony failed", null)
			});
			let a = oi(r);
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
		Ar(this.experimental);
		try {
			return await this._useSession(async (e) => {
				let { data: { session: t }, error: n } = e;
				if (n) return this._returnResult({
					data: null,
					error: n
				});
				if (!t) return this._returnResult({
					data: null,
					error: new k()
				});
				let { data: r, error: i } = await M(this.fetch, "POST", `${this.url}/passkeys/registration/options`, {
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
		Ar(this.experimental);
		try {
			return await this._useSession(async (t) => {
				let { data: { session: n }, error: r } = t;
				if (r) return this._returnResult({
					data: null,
					error: r
				});
				if (!n) return this._returnResult({
					data: null,
					error: new k()
				});
				let { data: i, error: a } = await M(this.fetch, "POST", `${this.url}/passkeys/registration/verify`, {
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
		Ar(this.experimental);
		try {
			let { data: t, error: n } = await M(this.fetch, "POST", `${this.url}/passkeys/authentication/options`, {
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
		Ar(this.experimental);
		try {
			let { data: t, error: n } = await M(this.fetch, "POST", `${this.url}/passkeys/authentication/verify`, {
				headers: this.headers,
				body: {
					challenge_id: e.challengeId,
					credential: e.credential
				},
				xform: N
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
		Ar(this.experimental);
		try {
			return await this._useSession(async (e) => {
				let { data: { session: t }, error: n } = e;
				if (n) return this._returnResult({
					data: null,
					error: n
				});
				if (!t) return this._returnResult({
					data: null,
					error: new k()
				});
				let { data: r, error: i } = await M(this.fetch, "GET", `${this.url}/passkeys`, {
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
		Ar(this.experimental);
		try {
			return await this._useSession(async (t) => {
				let { data: { session: n }, error: r } = t;
				if (r) return this._returnResult({
					data: null,
					error: r
				});
				if (!n) return this._returnResult({
					data: null,
					error: new k()
				});
				let { data: i, error: a } = await M(this.fetch, "PATCH", `${this.url}/passkeys/${e.passkeyId}`, {
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
		Ar(this.experimental);
		try {
			return await this._useSession(async (t) => {
				let { data: { session: n }, error: r } = t;
				if (r) return this._returnResult({
					data: null,
					error: r
				});
				if (!n) return this._returnResult({
					data: null,
					error: new k()
				});
				let { error: i } = await M(this.fetch, "DELETE", `${this.url}/passkeys/${e.passkeyId}`, {
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
bi.nextInstanceID = {};
//#endregion
//#region ../node_modules/@supabase/auth-js/dist/module/AuthClient.js
var xi = bi, Si = "2.110.3", Ci = "", wi;
typeof Deno < "u" ? (Ci = "deno", wi = Deno.version?.deno) : typeof document < "u" ? Ci = "web" : typeof navigator < "u" && navigator.product === "ReactNative" ? Ci = "react-native" : (Ci = "node", wi = typeof process < "u" ? process.version?.replace(/^v/, "") : void 0);
var Ti = [`runtime=${Ci}`];
wi && Ti.push(`runtime-version=${wi}`);
var Ei = { headers: { "X-Client-Info": `supabase-js/${Si}; ${Ti.join("; ")}` } }, Di = { schema: "public" }, Oi = {
	autoRefreshToken: !0,
	persistSession: !0,
	detectSessionInUrl: !0,
	flowType: "implicit"
}, ki = {}, Ai = {
	enabled: !1,
	respectSamplingDecision: !0
};
function ji(e, t, n, r) {
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
var Mi = null, Ni = "@opentelemetry/api";
function Pi() {
	return Mi === null && (Mi = import(
		/* webpackIgnore: true */
		/* turbopackIgnore: true */
		/* @vite-ignore */
		Ni
).catch(() => null)), Mi;
}
function Fi() {
	return ji(this, void 0, void 0, function* () {
		try {
			let e = yield Pi();
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
function Ii(e) {
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
function Li(e, t) {
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
			if (Ri(n.hostname, e)) return !0;
		} else if (e instanceof RegExp) {
			if (e.test(n.hostname)) return !0;
		} else if (typeof e == "function" && e(n)) return !0;
	} catch {
		continue;
	}
	return !1;
}
function Ri(e, t) {
	if (t === e) return !0;
	if (t.startsWith("*.")) {
		let n = t.slice(2);
		if (e.endsWith(n) && (e === n || e.endsWith("." + n))) return !0;
	}
	return !1;
}
function zi(e) {
	let t = [];
	try {
		let n = new URL(e);
		t.push(n.hostname);
	} catch {}
	return t.push("*.supabase.co", "*.supabase.in"), t.push("localhost", "127.0.0.1", "[::1]"), t;
}
function Bi(e) {
	"@babel/helpers - typeof";
	return Bi = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Bi(e);
}
function Vi(e, t) {
	if (Bi(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Bi(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Hi(e) {
	var t = Vi(e, "string");
	return Bi(t) == "symbol" ? t : t + "";
}
function Ui(e, t, n) {
	return (t = Hi(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Wi(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function F(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Wi(Object(n), !0).forEach(function(t) {
			Ui(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wi(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
var Gi = (e) => e ? (...t) => e(...t) : (...e) => fetch(...e), Ki = () => Headers, qi = (e, t, n, r, i) => {
	let a = Gi(r), o = Ki(), s = i?.enabled === !0, c = i?.respectSamplingDecision !== !1, l = s ? zi(t) : null;
	return async (t, r) => {
		let i = await n() ?? e, s = new o(r?.headers);
		if (s.has("apikey") || s.set("apikey", e), s.has("Authorization") || s.set("Authorization", `Bearer ${i}`), l) {
			let e = await Ji(t, l, c);
			e && (e.traceparent && !s.has("traceparent") && s.set("traceparent", e.traceparent), e.tracestate && !s.has("tracestate") && s.set("tracestate", e.tracestate), e.baggage && !s.has("baggage") && s.set("baggage", e.baggage));
		}
		return a(t, F(F({}, r), {}, { headers: s }));
	};
};
async function Ji(e, t, n) {
	if (!Li(typeof e == "string" || e instanceof URL ? e : e.url, t)) return null;
	let r = await Fi();
	if (!r || !r.traceparent) return null;
	if (n) {
		let e = Ii(r.traceparent);
		if (e && !e.isSampled) return null;
	}
	return r;
}
function Yi(e) {
	return typeof e == "boolean" ? { enabled: e } : e;
}
function Xi(e) {
	return e.endsWith("/") ? e : e + "/";
}
function Zi(e, t) {
	let { db: n, auth: r, realtime: i, global: a } = e, { db: o, auth: s, realtime: c, global: l } = t, u = Yi(e.tracePropagation), d = Yi(t.tracePropagation), f = {
		db: F(F({}, o), n),
		auth: F(F({}, s), r),
		realtime: F(F({}, c), i),
		storage: {},
		global: F(F(F({}, l), a), {}, { headers: F(F({}, l?.headers ?? {}), a?.headers ?? {}) }),
		tracePropagation: {
			enabled: u?.enabled ?? d?.enabled ?? !1,
			respectSamplingDecision: u?.respectSamplingDecision ?? d?.respectSamplingDecision ?? !0
		},
		accessToken: async () => ""
	};
	return e.accessToken ? f.accessToken = e.accessToken : delete f.accessToken, f;
}
function Qi(e) {
	let t = e?.trim();
	if (!t) throw Error("supabaseUrl is required.");
	if (!t.match(/^https?:\/\//i)) throw Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
	try {
		return new URL(Xi(t));
	} catch {
		throw Error("Invalid supabaseUrl: Provided URL is malformed.");
	}
}
var $i = class extends xi {
	constructor(e) {
		super(e);
	}
}, ea = class {
	constructor(e, t, n) {
		this.supabaseUrl = e, this.supabaseKey = t;
		let r = Qi(e);
		if (!t) throw Error("supabaseKey is required.");
		this.realtimeUrl = new URL("realtime/v1", r), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", r), this.storageUrl = new URL("storage/v1", r), this.functionsUrl = new URL("functions/v1", r);
		let i = `sb-${r.hostname.split(".")[0]}-auth-token`, a = {
			db: Di,
			realtime: ki,
			auth: F(F({}, Oi), {}, { storageKey: i }),
			global: Ei,
			tracePropagation: Ai
		}, o = Zi(n ?? {}, a);
		this.settings = o, this.storageKey = o.auth.storageKey ?? "", this.headers = o.global.headers ?? {}, o.accessToken ? (this.accessToken = o.accessToken, this.auth = new Proxy({}, { get: (e, t) => {
			throw Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(t)} is not possible`);
		} })) : this.auth = this._initSupabaseAuthClient(o.auth ?? {}, this.headers, o.global.fetch), this.fetch = qi(t, e, this._getAccessToken.bind(this), o.global.fetch, o.tracePropagation), this.realtime = this._initRealtimeClient(F({
			headers: this.headers,
			accessToken: this._getAccessToken.bind(this),
			fetch: this.fetch
		}, o.realtime)), this.accessToken && Promise.resolve(this.accessToken()).then((e) => this.realtime.setAuth(e)).catch((e) => console.warn("Failed to set initial Realtime auth token:", e)), this.rest = new oe(new URL("rest/v1", r).href, {
			headers: this.headers,
			schema: o.db.schema,
			fetch: this.fetch,
			timeout: o.db.timeout,
			urlLengthLimit: o.db.urlLengthLimit
		}), this.storage = new yn(this.storageUrl.href, this.headers, this.fetch, n?.storage), o.accessToken || this._listenForAuthEvents();
	}
	get functions() {
		return new l(this.functionsUrl.href, {
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
		return new $i({
			url: this.authUrl.href,
			headers: F(F({}, h), p),
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
		return new xt(this.realtimeUrl.href, F(F({}, e), {}, { params: F(F({}, { apikey: this.supabaseKey }), e?.params) }));
	}
	_listenForAuthEvents() {
		return this.auth.onAuthStateChange((e, t) => {
			this._handleTokenChanged(e, "CLIENT", t?.access_token);
		});
	}
	_handleTokenChanged(e, t, n) {
		(e === "TOKEN_REFRESHED" || e === "SIGNED_IN") && this.changedAccessToken !== n ? (this.changedAccessToken = n, this.realtime.setAuth(n)) : e === "SIGNED_OUT" && (this.realtime.setAuth(), t == "STORAGE" && this.auth.signOut(), this.changedAccessToken = void 0);
	}
}, ta = (e, t, n) => new ea(e, t, n);
function na() {
	if (typeof window < "u") return !1;
	let e = globalThis.process;
	if (!e) return !1;
	let t = e.version;
	if (t == null) return !1;
	let n = t.match(/^v(\d+)\./);
	return n ? parseInt(n[1], 10) <= 20 : !1;
}
na() && console.warn("⚠️  Node.js 20 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 22 or later. For more information, visit: https://github.com/orgs/supabase/discussions/45715");
//#endregion
//#region ../node_modules/groq-sdk/internal/tslib.mjs
function ra(e, t, n, r, i) {
	if (r === "m") throw TypeError("Private method is not writable");
	if (r === "a" && !i) throw TypeError("Private accessor was defined without a setter");
	if (typeof t == "function" ? e !== t || !i : !t.has(e)) throw TypeError("Cannot write private member to an object whose class did not declare it");
	return r === "a" ? i.call(e, n) : i ? i.value = n : t.set(e, n), n;
}
function I(e, t, n, r) {
	if (n === "a" && !r) throw TypeError("Private accessor was defined without a getter");
	if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw TypeError("Cannot read private member from an object whose class did not declare it");
	return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/uuid.mjs
var ia = function() {
	let { crypto: e } = globalThis;
	if (e?.randomUUID) return ia = e.randomUUID.bind(e), e.randomUUID();
	let t = /* @__PURE__ */ new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (e) => (e ^ n() & 15 >> e / 4).toString(16));
};
//#endregion
//#region ../node_modules/groq-sdk/internal/errors.mjs
function aa(e) {
	return typeof e == "object" && !!e && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var oa = (e) => {
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
}, L = class extends Error {}, R = class e extends L {
	constructor(t, n, r, i) {
		super(`${e.makeMessage(t, n, r)}`), this.status = t, this.headers = i, this.error = n;
	}
	static makeMessage(e, t, n) {
		let r = t?.message ? typeof t.message == "string" ? t.message : JSON.stringify(t.message) : t ? JSON.stringify(t) : n;
		return e && r ? `${e} ${r}` : e ? `${e} status code (no body)` : r || "(no status code or body)";
	}
	static generate(t, n, r, i) {
		if (!t || !i) return new ca({
			message: r,
			cause: oa(n)
		});
		let a = n;
		return t === 400 ? new ua(t, a, r, i) : t === 401 ? new da(t, a, r, i) : t === 403 ? new fa(t, a, r, i) : t === 404 ? new pa(t, a, r, i) : t === 409 ? new ma(t, a, r, i) : t === 422 ? new ha(t, a, r, i) : t === 429 ? new ga(t, a, r, i) : t >= 500 ? new _a(t, a, r, i) : new e(t, a, r, i);
	}
}, sa = class extends R {
	constructor({ message: e } = {}) {
		super(void 0, void 0, e || "Request was aborted.", void 0);
	}
}, ca = class extends R {
	constructor({ message: e, cause: t }) {
		super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
	}
}, la = class extends ca {
	constructor({ message: e } = {}) {
		super({ message: e ?? "Request timed out." });
	}
}, ua = class extends R {}, da = class extends R {}, fa = class extends R {}, pa = class extends R {}, ma = class extends R {}, ha = class extends R {}, ga = class extends R {}, _a = class extends R {}, va = /^[a-z][a-z0-9+.-]*:/i, ya = (e) => va.test(e), ba = (e) => (ba = Array.isArray, ba(e)), xa = ba;
function Sa(e) {
	if (!e) return !0;
	for (let t in e) return !1;
	return !0;
}
function Ca(e, t) {
	return Object.prototype.hasOwnProperty.call(e, t);
}
var wa = (e, t) => {
	if (typeof t != "number" || !Number.isInteger(t)) throw new L(`${e} must be an integer`);
	if (t < 0) throw new L(`${e} must be a positive integer`);
	return t;
}, Ta = (e) => {
	try {
		return JSON.parse(e);
	} catch {
		return;
	}
}, Ea = (e) => new Promise((t) => setTimeout(t, e)), Da = "1.3.0", Oa = () => typeof window < "u" && window.document !== void 0 && typeof navigator < "u";
function ka() {
	return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(globalThis.process === void 0 ? 0 : globalThis.process) === "[object process]" ? "node" : "unknown";
}
var Aa = () => {
	let e = ka();
	if (e === "deno") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Da,
		"X-Stainless-OS": Na(Deno.build.os),
		"X-Stainless-Arch": Ma(Deno.build.arch),
		"X-Stainless-Runtime": "deno",
		"X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
	};
	if (typeof EdgeRuntime < "u") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Da,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": `other:${EdgeRuntime}`,
		"X-Stainless-Runtime": "edge",
		"X-Stainless-Runtime-Version": globalThis.process.version
	};
	if (e === "node") return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Da,
		"X-Stainless-OS": Na(globalThis.process.platform ?? "unknown"),
		"X-Stainless-Arch": Ma(globalThis.process.arch ?? "unknown"),
		"X-Stainless-Runtime": "node",
		"X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
	};
	let t = ja();
	return t ? {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Da,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": `browser:${t.browser}`,
		"X-Stainless-Runtime-Version": t.version
	} : {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": Da,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": "unknown",
		"X-Stainless-Runtime-Version": "unknown"
	};
};
function ja() {
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
var Ma = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Na = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Pa, Fa = () => Pa ??= Aa();
//#endregion
//#region ../node_modules/groq-sdk/internal/shims.mjs
function Ia() {
	if (typeof fetch < "u") return fetch;
	throw Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Groq({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function La(...e) {
	let t = globalThis.ReadableStream;
	if (t === void 0) throw Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
	return new t(...e);
}
function Ra(e) {
	let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
	return La({
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
function za(e) {
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
async function Ba(e) {
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
var Va = ({ headers: e, body: t }) => ({
	bodyHeaders: { "content-type": "application/json" },
	body: JSON.stringify(t)
});
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/query.mjs
function Ha(e) {
	return Object.entries(e).filter(([e, t]) => t !== void 0).map(([e, t]) => {
		if (typeof t == "string" || typeof t == "number" || typeof t == "boolean") return `${encodeURIComponent(e)}=${encodeURIComponent(t)}`;
		if (t === null) return `${encodeURIComponent(e)}=`;
		throw new L(`Cannot stringify type ${typeof t}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
	}).join("&");
}
//#endregion
//#region ../node_modules/groq-sdk/internal/uploads.mjs
var Ua = () => {
	if (typeof File > "u") {
		let { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
		throw Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
	}
};
function Wa(e, t, n) {
	return Ua(), new File(e, t ?? "unknown_file", n);
}
function Ga(e) {
	return (typeof e == "object" && !!e && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Ka = (e) => typeof e == "object" && !!e && typeof e[Symbol.asyncIterator] == "function", qa = async (e, t) => ({
	...e,
	body: await Xa(e.body, t)
}), Ja = /* @__PURE__ */ new WeakMap();
function Ya(e) {
	let t = typeof e == "function" ? e : e.fetch, n = Ja.get(t);
	if (n) return n;
	let r = (async () => {
		try {
			let e = "Response" in t ? t.Response : (await t("data:,")).constructor, n = new FormData();
			return n.toString() !== await new e(n).text();
		} catch {
			return !0;
		}
	})();
	return Ja.set(t, r), r;
}
var Xa = async (e, t) => {
	if (!await Ya(t)) throw TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
	let n = new FormData();
	return await Promise.all(Object.entries(e || {}).map(([e, t]) => Qa(n, e, t))), n;
}, Za = (e) => e instanceof Blob && "name" in e, Qa = async (e, t, n) => {
	if (n !== void 0) {
		if (n == null) throw TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
		if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
		else if (n instanceof Response) e.append(t, Wa([await n.blob()], Ga(n)));
		else if (Ka(n)) e.append(t, Wa([await new Response(Ra(n)).blob()], Ga(n)));
		else if (Za(n)) e.append(t, n, Ga(n));
		else if (Array.isArray(n)) await Promise.all(n.map((n) => Qa(e, t + "[]", n)));
		else if (typeof n == "object") await Promise.all(Object.entries(n).map(([n, r]) => Qa(e, `${t}[${n}]`, r)));
		else throw TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
	}
}, $a = (e) => typeof e == "object" && !!e && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", eo = (e) => typeof e == "object" && !!e && typeof e.name == "string" && typeof e.lastModified == "number" && $a(e), to = (e) => typeof e == "object" && !!e && typeof e.url == "string" && typeof e.blob == "function";
async function no(e, t, n) {
	if (Ua(), e = await e, eo(e)) return e instanceof File ? e : Wa([await e.arrayBuffer()], e.name);
	if (to(e)) {
		let r = await e.blob();
		return t ||= new URL(e.url).pathname.split(/[\\/]/).pop(), Wa(await ro(r), t, n);
	}
	let r = await ro(e);
	if (t ||= Ga(e), !n?.type) {
		let e = r.find((e) => typeof e == "object" && "type" in e && e.type);
		typeof e == "string" && (n = {
			...n,
			type: e
		});
	}
	return Wa(r, t, n);
}
async function ro(e) {
	let t = [];
	if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
	else if ($a(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
	else if (Ka(e)) for await (let n of e) t.push(...await ro(n));
	else {
		let t = e?.constructor?.name;
		throw Error(`Unexpected data type: ${typeof e}${t ? `; constructor: ${t}` : ""}${io(e)}`);
	}
	return t;
}
function io(e) {
	return typeof e != "object" || !e ? "" : `; props: [${Object.getOwnPropertyNames(e).map((e) => `"${e}"`).join(", ")}]`;
}
//#endregion
//#region ../node_modules/groq-sdk/core/resource.mjs
var ao = class {
	constructor(e) {
		this._client = e;
	}
}, oo = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* so(e) {
	if (!e) return;
	if (oo in e) {
		let { values: t, nulls: n } = e;
		yield* t.entries();
		for (let e of n) yield [e, null];
		return;
	}
	let t = !1, n;
	e instanceof Headers ? n = e.entries() : xa(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
	for (let e of n) {
		let n = e[0];
		if (typeof n != "string") throw TypeError("expected header name to be a string");
		let r = xa(e[1]) ? e[1] : [e[1]], i = !1;
		for (let e of r) e !== void 0 && (t && !i && (i = !0, yield [n, null]), yield [n, e]);
	}
}
var co = (e) => {
	let t = new Headers(), n = /* @__PURE__ */ new Set();
	for (let r of e) {
		let e = /* @__PURE__ */ new Set();
		for (let [i, a] of so(r)) {
			let r = i.toLowerCase();
			e.has(r) || (t.delete(i), e.add(r)), a === null ? (t.delete(i), n.add(r)) : (t.append(i, a), n.delete(r));
		}
	}
	return {
		[oo]: !0,
		values: t,
		nulls: n
	};
}, lo = class extends ao {
	create(e, t) {
		return this._client.post("/openai/v1/audio/speech", {
			body: e,
			...t,
			headers: co([{ Accept: "audio/wav" }, t?.headers]),
			__binaryResponse: !0
		});
	}
}, uo = class extends ao {
	create(e, t) {
		return this._client.post("/openai/v1/audio/transcriptions", qa({
			body: e,
			...t
		}, this._client));
	}
}, fo = class extends ao {
	create(e, t) {
		return this._client.post("/openai/v1/audio/translations", qa({
			body: e,
			...t
		}, this._client));
	}
}, po = class extends ao {
	constructor() {
		super(...arguments), this.speech = new lo(this._client), this.transcriptions = new uo(this._client), this.translations = new fo(this._client);
	}
};
po.Speech = lo, po.Transcriptions = uo, po.Translations = fo;
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/path.mjs
function mo(e) {
	return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var ho = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), go = /* @__PURE__ */ ((e = mo) => function(t, ...n) {
	if (t.length === 1) return t[0];
	let r = !1, i = [], a = t.reduce((t, a, o) => {
		/[?#]/.test(a) && (r = !0);
		let s = n[o], c = (r ? encodeURIComponent : e)("" + s);
		return o !== n.length && (s == null || typeof s == "object" && s.toString === Object.getPrototypeOf(Object.getPrototypeOf(s.hasOwnProperty ?? ho) ?? ho)?.toString) && (c = s + "", i.push({
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
		throw new L(`Path parameters result in path with invalid segments:\n${i.map((e) => e.error).join("\n")}\n${a}\n${t}`);
	}
	return a;
})(mo), _o = class extends ao {
	create(e, t) {
		return this._client.post("/openai/v1/batches", {
			body: e,
			...t
		});
	}
	retrieve(e, t) {
		return this._client.get(go`/openai/v1/batches/${e}`, t);
	}
	list(e) {
		return this._client.get("/openai/v1/batches", e);
	}
	cancel(e, t) {
		return this._client.post(go`/openai/v1/batches/${e}/cancel`, t);
	}
}, vo = class extends ao {
	create(e, t) {
		return this._client.post("/openai/v1/chat/completions", {
			body: e,
			...t,
			stream: e.stream ?? !1
		});
	}
}, yo = class extends ao {
	constructor() {
		super(...arguments), this.completions = new vo(this._client);
	}
};
yo.Completions = vo;
//#endregion
//#region ../node_modules/groq-sdk/resources/completions.mjs
var bo = class extends ao {}, xo = class extends ao {
	create(e, t) {
		return this._client.post("/openai/v1/embeddings", {
			body: e,
			...t
		});
	}
}, So = class extends ao {
	create(e, t) {
		return this._client.post("/openai/v1/files", qa({
			body: e,
			...t
		}, this._client));
	}
	list(e) {
		return this._client.get("/openai/v1/files", e);
	}
	delete(e, t) {
		return this._client.delete(go`/openai/v1/files/${e}`, t);
	}
	content(e, t) {
		return this._client.get(go`/openai/v1/files/${e}/content`, {
			...t,
			headers: co([{ Accept: "application/octet-stream" }, t?.headers]),
			__binaryResponse: !0
		});
	}
	info(e, t) {
		return this._client.get(go`/openai/v1/files/${e}`, t);
	}
}, Co = class extends ao {
	retrieve(e, t) {
		return this._client.get(go`/openai/v1/models/${e}`, t);
	}
	list(e) {
		return this._client.get("/openai/v1/models", e);
	}
	delete(e, t) {
		return this._client.delete(go`/openai/v1/models/${e}`, t);
	}
};
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/bytes.mjs
function wo(e) {
	let t = 0;
	for (let n of e) t += n.length;
	let n = new Uint8Array(t), r = 0;
	for (let t of e) n.set(t, r), r += t.length;
	return n;
}
var To;
function Eo(e) {
	let t;
	return (To ??= (t = new globalThis.TextEncoder(), t.encode.bind(t)))(e);
}
var Do;
function Oo(e) {
	let t;
	return (Do ??= (t = new globalThis.TextDecoder(), t.decode.bind(t)))(e);
}
//#endregion
//#region ../node_modules/groq-sdk/internal/decoders/line.mjs
var z, B, ko = class {
	constructor() {
		z.set(this, void 0), B.set(this, void 0), ra(this, z, /* @__PURE__ */ new Uint8Array(), "f"), ra(this, B, null, "f");
	}
	decode(e) {
		if (e == null) return [];
		let t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Eo(e) : e;
		ra(this, z, wo([I(this, z, "f"), t]), "f");
		let n = [], r;
		for (; (r = Ao(I(this, z, "f"), I(this, B, "f"))) != null;) {
			if (r.carriage && I(this, B, "f") == null) {
				ra(this, B, r.index, "f");
				continue;
			}
			if (I(this, B, "f") != null && (r.index !== I(this, B, "f") + 1 || r.carriage)) {
				n.push(Oo(I(this, z, "f").subarray(0, I(this, B, "f") - 1))), ra(this, z, I(this, z, "f").subarray(I(this, B, "f")), "f"), ra(this, B, null, "f");
				continue;
			}
			let e = I(this, B, "f") === null ? r.preceding : r.preceding - 1, t = Oo(I(this, z, "f").subarray(0, e));
			n.push(t), ra(this, z, I(this, z, "f").subarray(r.index), "f"), ra(this, B, null, "f");
		}
		return n;
	}
	flush() {
		return I(this, z, "f").length ? this.decode("\n") : [];
	}
};
z = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap(), ko.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]), ko.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Ao(e, t) {
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
function jo(e) {
	for (let t = 0; t < e.length - 1; t++) {
		if (e[t] === 10 && e[t + 1] === 10 || e[t] === 13 && e[t + 1] === 13) return t + 2;
		if (e[t] === 13 && e[t + 1] === 10 && t + 3 < e.length && e[t + 2] === 13 && e[t + 3] === 10) return t + 4;
	}
	return -1;
}
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/log.mjs
var Mo = {
	off: 0,
	error: 200,
	warn: 300,
	info: 400,
	debug: 500
}, No = (e, t, n) => {
	if (e) {
		if (Ca(Mo, e)) return e;
		V(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Mo))}`);
	}
};
function Po() {}
function Fo(e, t, n) {
	return !t || Mo[e] > Mo[n] ? Po : t[e].bind(t);
}
var Io = {
	error: Po,
	warn: Po,
	info: Po,
	debug: Po
}, Lo = /* @__PURE__ */ new WeakMap();
function V(e) {
	let t = e.logger, n = e.logLevel ?? "off";
	if (!t) return Io;
	let r = Lo.get(t);
	if (r && r[0] === n) return r[1];
	let i = {
		error: Fo("error", t, n),
		warn: Fo("warn", t, n),
		info: Fo("info", t, n),
		debug: Fo("debug", t, n)
	};
	return Lo.set(t, [n, i]), i;
}
var Ro = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers &&= Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([e, t]) => [e, e.toLowerCase() === "authorization" || e.toLowerCase() === "api-key" || e.toLowerCase() === "x-api-key" || e.toLowerCase() === "cookie" || e.toLowerCase() === "set-cookie" ? "***" : t])), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), zo, Bo = class e {
	constructor(e, t, n) {
		this.iterator = e, zo.set(this, void 0), this.controller = t, ra(this, zo, n, "f");
	}
	static fromSSEResponse(t, n, r) {
		let i = !1, a = r ? V(r) : console;
		async function* o() {
			if (i) throw new L("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			i = !0;
			let e = !1;
			try {
				for await (let r of Vo(t, n)) if (!e) {
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
						if (e && e.error) throw new R(void 0, e.error, void 0, t.headers);
						yield e;
					} else {
						let e;
						try {
							e = JSON.parse(r.data);
						} catch (e) {
							throw console.error("Could not parse message into JSON:", r.data), console.error("From chunk:", r.raw), e;
						}
						if (r.event == "error") throw new R(void 0, e.error, e.message, void 0);
						yield {
							event: r.event,
							data: e
						};
					}
				}
				e = !0;
			} catch (e) {
				if (aa(e)) return;
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
			let e = new ko(), n = za(t);
			for await (let t of n) for (let n of e.decode(t)) yield n;
			for (let t of e.flush()) yield t;
		}
		async function* o() {
			if (i) throw new L("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
			i = !0;
			let e = !1;
			try {
				for await (let t of a()) e || t && (yield JSON.parse(t));
				e = !0;
			} catch (e) {
				if (aa(e)) return;
				throw e;
			} finally {
				e || n.abort();
			}
		}
		return new e(o, n, r);
	}
	[(zo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
		return [new e(() => i(t), this.controller, I(this, zo, "f")), new e(() => i(n), this.controller, I(this, zo, "f"))];
	}
	toReadableStream() {
		let e = this, t;
		return La({
			async start() {
				t = e[Symbol.asyncIterator]();
			},
			async pull(e) {
				try {
					let { value: n, done: r } = await t.next();
					if (r) return e.close();
					let i = Eo(JSON.stringify(n) + "\n");
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
async function* Vo(e, t) {
	if (!e.body) throw t.abort(), globalThis.navigator !== void 0 && globalThis.navigator.product === "ReactNative" ? new L("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new L("Attempted to iterate over a response with no body");
	let n = new Uo(), r = new ko(), i = za(e.body);
	for await (let e of Ho(i)) for (let t of r.decode(e)) {
		let e = n.decode(t);
		e && (yield e);
	}
	for (let e of r.flush()) {
		let t = n.decode(e);
		t && (yield t);
	}
}
async function* Ho(e) {
	let t = /* @__PURE__ */ new Uint8Array();
	for await (let n of e) {
		if (n == null) continue;
		let e = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Eo(n) : n, r = new Uint8Array(t.length + e.length);
		r.set(t), r.set(e, t.length), t = r;
		let i;
		for (; (i = jo(t)) !== -1;) yield t.slice(0, i), t = t.slice(i);
	}
	t.length > 0 && (yield t);
}
var Uo = class {
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
		let [t, n, r] = Wo(e, ":");
		return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
	}
};
function Wo(e, t) {
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
async function Go(e, t) {
	let { response: n, requestLogID: r, retryOfRequestLogID: i, startTime: a } = t, o = await (async () => {
		if (n.status === 204) return null;
		if (t.options.__binaryResponse) return n;
		if (t.options.stream) return Bo.fromSSEResponse(n, t.controller, e);
		let r = n.headers.get("content-type")?.split(";")[0]?.trim();
		return r?.includes("application/json") || r?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
	})();
	return V(e).debug(`[${r}] response parsed`, Ro({
		retryOfRequestLogID: i,
		url: n.url,
		status: n.status,
		body: o,
		durationMs: Date.now() - a
	})), o;
}
//#endregion
//#region ../node_modules/groq-sdk/core/api-promise.mjs
var Ko, qo = class e extends Promise {
	constructor(e, t, n = Go) {
		super((e) => {
			e(null);
		}), this.responsePromise = t, this.parseResponse = n, Ko.set(this, void 0), ra(this, Ko, e, "f");
	}
	_thenUnwrap(t) {
		return new e(I(this, Ko, "f"), this.responsePromise, async (e, n) => t(await this.parseResponse(e, n), n));
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
		return this.parsedPromise ||= this.responsePromise.then((e) => this.parseResponse(I(this, Ko, "f"), e)), this.parsedPromise;
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
Ko = /* @__PURE__ */ new WeakMap();
//#endregion
//#region ../node_modules/groq-sdk/internal/utils/env.mjs
var Jo = (e) => {
	if (globalThis.process !== void 0) return globalThis.process.env?.[e]?.trim() || void 0;
	if (globalThis.Deno !== void 0) return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Yo, Xo, Zo, Qo, H = class {
	constructor({ baseURL: e = Jo("GROQ_BASE_URL"), apiKey: t = Jo("GROQ_API_KEY"), ...n } = {}) {
		if (Yo.add(this), Zo.set(this, void 0), this.completions = new bo(this), this.chat = new yo(this), this.embeddings = new xo(this), this.audio = new po(this), this.models = new Co(this), this.batches = new _o(this), this.files = new So(this), t === void 0) throw new L("The GROQ_API_KEY environment variable is missing or empty; either provide it, or instantiate the Groq client with an apiKey option, like new Groq({ apiKey: 'My API Key' }).");
		let r = {
			apiKey: t,
			...n,
			baseURL: e || "https://api.groq.com"
		};
		if (!r.dangerouslyAllowBrowser && Oa()) throw new L("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Groq({ apiKey, dangerouslyAllowBrowser: true })");
		this.baseURL = r.baseURL, this.timeout = r.timeout ?? Xo.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
		let i = "warn";
		this.logLevel = i, this.logLevel = No(r.logLevel, "ClientOptions.logLevel", this) ?? No(Jo("GROQ_LOG"), "process.env['GROQ_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? Ia(), ra(this, Zo, Va, "f");
		let a = Jo("GROQ_CUSTOM_HEADERS");
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
		return co([{ Authorization: `Bearer ${this.apiKey}` }]);
	}
	stringifyQuery(e) {
		return Ha(e);
	}
	getUserAgent() {
		return `${this.constructor.name}/JS ${Da}`;
	}
	defaultIdempotencyKey() {
		return `stainless-node-retry-${ia()}`;
	}
	makeStatusError(e, t, n, r) {
		return R.generate(e, t, n, r);
	}
	buildURL(e, t, n) {
		let r = !I(this, Yo, "m", Qo).call(this) && n || this.baseURL, i = ya(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), a = this.defaultQuery(), o = Object.fromEntries(i.searchParams);
		return (!Sa(a) || !Sa(o)) && (t = {
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
		return new qo(this, this.makeRequest(e, t, void 0));
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
		if (V(this).debug(`[${c}] sending request`, Ro({
			retryOfRequestLogID: n,
			method: r.method,
			url: o,
			options: r,
			headers: a.headers
		})), r.signal?.aborted) throw new sa();
		let d = new AbortController(), f = await this.fetchWithTimeout(o, a, s, d).catch(oa), p = Date.now();
		if (f instanceof globalThis.Error) {
			let e = `retrying, ${t} attempts remaining`;
			if (r.signal?.aborted) throw new sa();
			let i = aa(f) || /timed? ?out/i.test(String(f) + ("cause" in f ? String(f.cause) : ""));
			if (t) return V(this).info(`[${c}] connection ${i ? "timed out" : "failed"} - ${e}`), V(this).debug(`[${c}] connection ${i ? "timed out" : "failed"} (${e})`, Ro({
				retryOfRequestLogID: n,
				url: o,
				durationMs: p - u,
				message: f.message
			})), this.retryRequest(r, t, n ?? c);
			throw V(this).info(`[${c}] connection ${i ? "timed out" : "failed"} - error; no more retries left`), V(this).debug(`[${c}] connection ${i ? "timed out" : "failed"} (error; no more retries left)`, Ro({
				retryOfRequestLogID: n,
				url: o,
				durationMs: p - u,
				message: f.message
			})), i ? new la() : new ca({ cause: f });
		}
		let m = `[${c}${l}] ${a.method} ${o} ${f.ok ? "succeeded" : "failed"} with status ${f.status} in ${p - u}ms`;
		if (!f.ok) {
			let e = await this.shouldRetry(f);
			if (t && e) {
				let e = `retrying, ${t} attempts remaining`;
				return await Ba(f.body), V(this).info(`${m} - ${e}`), V(this).debug(`[${c}] response error (${e})`, Ro({
					retryOfRequestLogID: n,
					url: f.url,
					status: f.status,
					headers: f.headers,
					durationMs: p - u
				})), this.retryRequest(r, t, n ?? c, f.headers);
			}
			let i = e ? "error; no more retries left" : "error; not retryable";
			V(this).info(`${m} - ${i}`);
			let a = await f.text().catch((e) => oa(e).message), o = Ta(a), s = o ? void 0 : a;
			throw V(this).debug(`[${c}] response error (${i})`, Ro({
				retryOfRequestLogID: n,
				url: f.url,
				status: f.status,
				headers: f.headers,
				message: s,
				durationMs: Date.now() - u
			})), this.makeStatusError(f.status, o, s, f.headers);
		}
		return V(this).info(m), V(this).debug(`[${c}] response start`, Ro({
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
		return await Ea(i), this.makeRequest(e, t - 1, n);
	}
	calculateDefaultRetryTimeoutMillis(e, t) {
		let n = t - e;
		return Math.min(.5 * 2 ** n, 8) * (1 - Math.random() * .25) * 1e3;
	}
	async buildRequest(e, { retryCount: t = 0 } = {}) {
		let n = { ...e }, { method: r, path: i, query: a, defaultBaseURL: o } = n, s = this.buildURL(i, a, o);
		"timeout" in n && wa("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
		let a = co([
			i,
			{
				Accept: "application/json",
				"User-Agent": this.getUserAgent(),
				"X-Stainless-Retry-Count": String(r),
				...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
				...Fa()
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
		if (!t) return t == null && "body" in e ? I(this, Zo, "f").call(this, {
			body: t,
			headers: co([n])
		}) : {
			bodyHeaders: void 0,
			body: void 0
		};
		let r = co([n]);
		return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
			bodyHeaders: void 0,
			body: t
		} : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
			bodyHeaders: void 0,
			body: Ra(t)
		} : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
			bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
			body: this.stringifyQuery(t)
		} : I(this, Zo, "f").call(this, {
			body: t,
			headers: r
		});
	}
};
Xo = H, Zo = /* @__PURE__ */ new WeakMap(), Yo = /* @__PURE__ */ new WeakSet(), Qo = function() {
	return this.baseURL !== "https://api.groq.com";
}, H.Groq = Xo, H.DEFAULT_TIMEOUT = 6e4, H.GroqError = L, H.APIError = R, H.APIConnectionError = ca, H.APIConnectionTimeoutError = la, H.APIUserAbortError = sa, H.NotFoundError = pa, H.ConflictError = ma, H.RateLimitError = ga, H.BadRequestError = ua, H.AuthenticationError = da, H.InternalServerError = _a, H.PermissionDeniedError = fa, H.UnprocessableEntityError = ha, H.toFile = no, H.Completions = bo, H.Chat = yo, H.Embeddings = xo, H.Audio = po, H.Models = Co, H.Batches = _o, H.Files = So;
//#endregion
//#region ../shared/prompts/defaultPrompt.js
var $o = "You are an expert open-source repository maintainer, systems architect, and technical analyst. Your sole responsibility is to analyze an incoming GitHub issue, extract its core technical context, and cross-reference it against existing historical context to identify duplicate or overlapping submissions.\n\nINCOMING ISSUE DATA\nThe incoming issue will belong to one of several templates (e.g., Bug, Feature, Security, Performance, Refactor, UI/UX, Docs, Test, Good First Issue). The following fields have been parsed from the submission (fields not applicable to this specific issue type will remain empty):\n\n1. Core Problem / Request:\n{{issue.primary_description}}\n\n2. Context & Reproduction:\n{{issue.context_steps}}\n\n3. Proposed Solution / Impact:\n{{issue.expected_outcome}}\n\n4. Technical Metrics & Environment:\n{{issue.technical_metrics}}\n\nHISTORICAL REPOSITORY CONTEXT\nThe following is an array of existing active or resolved issue IDs along with their previously computed summaries to check against for duplicates:\n{{repository.historical_context_log}}\n\nANALYSIS GUIDELINES\n- Determine the Scope:\n  - Bugs & Security: Isolate root causes (e.g., stack traces, bottlenecks, vulnerabilities).\n  - Features & UI: Analyze the architectural impact, DOM manipulations, or accessibility concerns.\n  - Performance & Refactor: Evaluate the proposed system modifications against current benchmarks.\n- Handle Incomplete Templates: Rely strictly on the fields provided. Do not invent missing facts or infer technical metrics if the user omitted them.\n- Trace Structural Links: Classify an issue as a duplicate ONLY if it targets the exact same code-path break, UI component failure, or architectural enhancement as a historical issue.\n\nOUTPUT COMPLIANCE CONTRACT\nYou MUST respond using a single, valid JSON object.\nDo NOT wrap the JSON inside markdown code blocks (such as ```json ... ```).\nDo NOT include any conversational introduction, sign-offs, or explanatory prose outside of the JSON keys.\nEnsure all quotes inside text strings are properly escaped to prevent parsing failures.\n\nYour response must strictly conform to the following schema structure:\n{\n  \"is_duplicate\": true,\n  \"analysis_summary\": \"Provide a thorough technical breakdown explaining why this issue is structurally linked to an existing issue, or if unique, a crisp summary of its core scope.\"\n}\n";
//#endregion
//#region ../shared/utils/renderPrompt.js
function es(e, t) {
	return e.replace(/\{\{([^}]+)\}\}/g, (e, n) => {
		let r = n.trim().split("."), i = t;
		for (let e of r) {
			if (typeof i != "object" || !i) return "";
			i = i[e];
		}
		return i == null ? "" : String(i);
	});
}
function ts(e, t) {
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
var ns = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {}
}, rs = "repoOwlConfig", is = null;
async function as() {
	let e = {};
	return typeof chrome < "u" && chrome.storage?.local && (e = (await chrome.storage.local.get([rs]))[rs] || {}), e.supabaseUrl ||= "https://sdgazpgnenkammrlhjel.supabase.co", e.supabaseAnonKey ||= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", e;
}
async function os() {
	let e = await as();
	return !!(e.supabaseUrl && e.supabaseAnonKey);
}
async function ss() {
	if (!await os()) return null;
	if (!is) {
		let e = await as();
		is = ta(e.supabaseUrl, e.supabaseAnonKey, { auth: {
			persistSession: !1,
			autoRefreshToken: !1,
			detectSessionInUrl: !1,
			storage: ns
		} });
	}
	return is;
}
async function cs() {
	let e = await ss();
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
//#region __vite-browser-external
var ls = /* @__PURE__ */ e(((e, t) => {
	t.exports = {};
}));
//#endregion
//#region ../node_modules/libsodium/dist/modules-esm/libsodium.mjs
async function us(e = {}) {
	var t, n = e, r = !!globalThis.window, i = !!globalThis.WorkerGlobalScope, a = (globalThis.process?.versions?.node && globalThis.process, import.meta.url);
	if (r || i) {
		try {
			new URL(".", a).href;
		} catch {}
		i && (t = (e) => {
			var t = new XMLHttpRequest();
			return t.open("GET", e, !1), t.responseType = "arraybuffer", t.send(null), new Uint8Array(t.response);
		});
	}
	(function() {}).bind();
	var o, s, c, l, u, d, f, p, m, h, g, _ = function() {}.bind(), v = !1, y = !1;
	function b() {
		var e = fe.buffer;
		f = new Int8Array(e), u = new Int16Array(e), n.HEAPU8 = g = new Uint8Array(e), new Uint16Array(e), d = new Int32Array(e), h = new Uint32Array(e), p = new Float32Array(e), m = new Float64Array(e);
	}
	function x(e) {
		n.onAbort?.(e), _(e = `Aborted(${e})`), v = !0, e += ". Build with -sASSERTIONS for more info.";
		var t = new WebAssembly.RuntimeError(e);
		throw c?.(t), t;
	}
	for (var ee = (e) => {
		for (; e.length > 0;) e.shift()(n);
	}, te = [], ne = (e) => te.push(e), re = [], ie = (e) => re.push(e), ae = globalThis.TextDecoder && new TextDecoder(), oe = (e, t, n) => e ? ((e, t = 0, n, r) => {
		var i = ((e, t, n, r) => {
			var i = t + n;
			if (r) return i;
			for (; e[t] && !(t >= i);) ++t;
			return t;
		})(e, t, n, r);
		if (i - t > 16 && e.buffer && ae) return ae.decode(e.subarray(t, i));
		for (var a = ""; t < i;) {
			var o = e[t++];
			if (128 & o) {
				var s = 63 & e[t++];
				if ((224 & o) != 192) {
					var c = 63 & e[t++];
					if ((o = (240 & o) == 224 ? (15 & o) << 12 | s << 6 | c : (7 & o) << 18 | s << 12 | c << 6 | 63 & e[t++]) < 65536) a += String.fromCharCode(o);
					else {
						var l = o - 65536;
						a += String.fromCharCode(55296 | l >> 10, 56320 | 1023 & l);
					}
				} else a += String.fromCharCode((31 & o) << 6 | s);
			} else a += String.fromCharCode(o);
		}
		return a;
	})(g, e, t, n) : "", se = [], ce = (e, t) => Math.ceil(e / t) * t, le = (e) => {
		var t = (e - fe.buffer.byteLength + 65535) / 65536 | 0;
		try {
			return fe.grow(t), b(), 1;
		} catch {}
	}, ue = /* @__PURE__ */ new Uint8Array(123), de = 25; de >= 0; --de) ue[48 + de] = 52 + de, ue[65 + de] = de, ue[97 + de] = 26 + de;
	if (ue[43] = 62, ue[47] = 63, n.noExitRuntime && n.noExitRuntime, n.print && n.print, n.printErr && (_ = n.printErr), n.wasmBinary && (o = n.wasmBinary), n.arguments && n.arguments, n.thisProgram && n.thisProgram, n.preInit) for (typeof n.preInit == "function" && (n.preInit = [n.preInit]); n.preInit.length > 0;) n.preInit.shift()();
	n.setValue = function(e, t, n = "i8") {
		switch (n.endsWith("*") && (n = "*"), n) {
			case "i1":
			case "i8":
				f[e] = t;
				break;
			case "i16":
				u[e >> 1] = t;
				break;
			case "i32":
				d[e >> 2] = t;
				break;
			case "i64": x("to do setValue(i64) use WASM_BIGINT");
			case "float":
				p[e >> 2] = t;
				break;
			case "double":
				m[e >> 3] = t;
				break;
			case "*":
				h[e >> 2] = t;
				break;
			default: x(`invalid type for setValue: ${n}`);
		}
	}, n.getValue = function(e, t = "i8") {
		switch (t.endsWith("*") && (t = "*"), t) {
			case "i1":
			case "i8": return f[e];
			case "i16": return u[e >> 1];
			case "i32": return d[e >> 2];
			case "i64": x("to do getValue(i64) use WASM_BIGINT");
			case "float": return p[e >> 2];
			case "double": return m[e >> 3];
			case "*": return h[e >> 2];
			default: x(`invalid type for getValue: ${t}`);
		}
	}, n.UTF8ToString = oe;
	var fe, S, pe = {
		40216: () => n.getRandomValue(),
		40252: () => {
			if (n.getRandomValue === void 0) try {
				var e = typeof window == "object" ? window : self, t = e.crypto === void 0 ? e.msCrypto : e.crypto;
				t = t === void 0 ? i : t;
				var r = function() {
					var e = /* @__PURE__ */ new Uint32Array(1);
					return t.getRandomValues(e), e[0] >>> 0;
				};
				r(), n.getRandomValue = r;
			} catch {
				try {
					var i = ls(), a = function() {
						var e = i.randomBytes(4);
						return (e[0] << 24 | e[1] << 16 | e[2] << 8 | e[3]) >>> 0;
					};
					a(), n.getRandomValue = a;
				} catch {
					throw "No secure random number generator found";
				}
			}
		}
	}, me = {
		a: (e, t, n, r) => x(`Assertion failed: ${oe(e)}, at: ` + [
			t ? oe(t) : "unknown filename",
			n,
			r ? oe(r) : "unknown function"
		]),
		c: () => x(""),
		b: (e, t, n) => ((e, t, n) => {
			var r = ((e, t) => {
				var n;
				for (se.length = 0; n = g[e++];) {
					var r = n != 105;
					t += (r &= n != 112) && t % 8 ? 4 : 0, se.push(n == 112 ? h[t >> 2] : n == 105 ? d[t >> 2] : m[t >> 3]), t += r ? 8 : 4;
				}
				return se;
			})(t, n);
			return pe[e](...r);
		})(e, t, n),
		d: (e) => {
			var t = g.length, n = 2147483648;
			if ((e >>>= 0) > n) return !1;
			for (var r = 1; r <= 4; r *= 2) {
				var i = t * (1 + .2 / r);
				if (i = Math.min(i, e + 100663296), le(Math.min(n, ce(Math.max(e, i), 65536)))) return !0;
			}
			return !1;
		}
	};
	return S = await async function() {
		function e(e, t) {
			return function(e) {
				n._crypto_aead_aegis128l_keybytes = e.f, n._crypto_aead_aegis128l_nsecbytes = e.g, n._crypto_aead_aegis128l_npubbytes = e.h, n._crypto_aead_aegis128l_abytes = e.i, n._crypto_aead_aegis128l_messagebytes_max = e.j, n._crypto_aead_aegis128l_keygen = e.k, n._crypto_aead_aegis128l_encrypt = e.l, n._crypto_aead_aegis128l_encrypt_detached = e.m, n._crypto_aead_aegis128l_decrypt = e.n, n._crypto_aead_aegis128l_decrypt_detached = e.o, n._crypto_aead_aegis256_keybytes = e.p, n._crypto_aead_aegis256_nsecbytes = e.q, n._crypto_aead_aegis256_npubbytes = e.r, n._crypto_aead_aegis256_abytes = e.s, n._crypto_aead_aegis256_messagebytes_max = e.t, n._crypto_aead_aegis256_keygen = e.u, n._crypto_aead_aegis256_encrypt = e.v, n._crypto_aead_aegis256_encrypt_detached = e.w, n._crypto_aead_aegis256_decrypt = e.x, n._crypto_aead_aegis256_decrypt_detached = e.y, n._crypto_aead_aes256gcm_is_available = e.z, n._crypto_aead_chacha20poly1305_encrypt_detached = e.A, n._crypto_aead_chacha20poly1305_encrypt = e.B, n._crypto_aead_chacha20poly1305_ietf_encrypt_detached = e.C, n._crypto_aead_chacha20poly1305_ietf_encrypt = e.D, n._crypto_aead_chacha20poly1305_decrypt_detached = e.E, n._crypto_aead_chacha20poly1305_decrypt = e.F, n._crypto_aead_chacha20poly1305_ietf_decrypt_detached = e.G, n._crypto_aead_chacha20poly1305_ietf_decrypt = e.H, n._crypto_aead_chacha20poly1305_ietf_keybytes = e.I, n._crypto_aead_chacha20poly1305_ietf_npubbytes = e.J, n._crypto_aead_chacha20poly1305_ietf_nsecbytes = e.K, n._crypto_aead_chacha20poly1305_ietf_abytes = e.L, n._crypto_aead_chacha20poly1305_ietf_messagebytes_max = e.M, n._crypto_aead_chacha20poly1305_ietf_keygen = e.N, n._crypto_aead_chacha20poly1305_keybytes = e.O, n._crypto_aead_chacha20poly1305_npubbytes = e.P, n._crypto_aead_chacha20poly1305_nsecbytes = e.Q, n._crypto_aead_chacha20poly1305_abytes = e.R, n._crypto_aead_chacha20poly1305_messagebytes_max = e.S, n._crypto_aead_chacha20poly1305_keygen = e.T, n._crypto_aead_xchacha20poly1305_ietf_encrypt_detached = e.U, n._crypto_aead_xchacha20poly1305_ietf_encrypt = e.V, n._crypto_aead_xchacha20poly1305_ietf_decrypt_detached = e.W, n._crypto_aead_xchacha20poly1305_ietf_decrypt = e.X, n._crypto_aead_xchacha20poly1305_ietf_keybytes = e.Y, n._crypto_aead_xchacha20poly1305_ietf_npubbytes = e.Z, n._crypto_aead_xchacha20poly1305_ietf_nsecbytes = e._, n._crypto_aead_xchacha20poly1305_ietf_abytes = e.$, n._crypto_aead_xchacha20poly1305_ietf_messagebytes_max = e.aa, n._crypto_aead_xchacha20poly1305_ietf_keygen = e.ba, n._crypto_auth_bytes = e.ca, n._crypto_auth_keybytes = e.da, n._crypto_auth = e.ea, n._crypto_auth_verify = e.fa, n._crypto_auth_keygen = e.ga, n._crypto_box_seedbytes = e.ha, n._crypto_box_publickeybytes = e.ia, n._crypto_box_secretkeybytes = e.ja, n._crypto_box_beforenmbytes = e.ka, n._crypto_box_noncebytes = e.la, n._crypto_box_macbytes = e.ma, n._crypto_box_messagebytes_max = e.na, n._crypto_box_seed_keypair = e.oa, n._crypto_box_keypair = e.pa, n._crypto_box_beforenm = e.qa, n._crypto_box_detached_afternm = e.ra, n._crypto_box_detached = e.sa, n._crypto_box_easy_afternm = e.ta, n._crypto_box_easy = e.ua, n._crypto_box_open_detached_afternm = e.va, n._crypto_box_open_detached = e.wa, n._crypto_box_open_easy_afternm = e.xa, n._crypto_box_open_easy = e.ya, n._crypto_box_seal = e.za, n._crypto_box_seal_open = e.Aa, n._crypto_box_sealbytes = e.Ba, n._crypto_generichash_bytes_min = e.Ca, n._crypto_generichash_bytes_max = e.Da, n._crypto_generichash_bytes = e.Ea, n._crypto_generichash_keybytes_min = e.Fa, n._crypto_generichash_keybytes_max = e.Ga, n._crypto_generichash_keybytes = e.Ha, n._crypto_generichash_statebytes = e.Ia, n._crypto_generichash = e.Ja, n._crypto_generichash_init = e.Ka, n._crypto_generichash_update = e.La, n._crypto_generichash_final = e.Ma, n._crypto_generichash_keygen = e.Na, n._crypto_hash_bytes = e.Oa, n._crypto_hash = e.Pa, n._crypto_hash_sha3256_bytes = e.Qa, n._crypto_hash_sha3256_statebytes = e.Ra, n._crypto_hash_sha3256_init = e.Sa, n._crypto_hash_sha3256_update = e.Ta, n._crypto_hash_sha3256_final = e.Ua, n._crypto_hash_sha3256 = e.Va, n._crypto_hash_sha3512_bytes = e.Wa, n._crypto_hash_sha3512_statebytes = e.Xa, n._crypto_hash_sha3512_init = e.Ya, n._crypto_hash_sha3512_update = e.Za, n._crypto_hash_sha3512_final = e._a, n._crypto_hash_sha3512 = e.$a, n._crypto_ipcrypt_bytes = e.ab, n._crypto_ipcrypt_keybytes = e.bb, n._crypto_ipcrypt_nd_keybytes = e.cb, n._crypto_ipcrypt_nd_tweakbytes = e.db, n._crypto_ipcrypt_nd_inputbytes = e.eb, n._crypto_ipcrypt_nd_outputbytes = e.fb, n._crypto_ipcrypt_ndx_keybytes = e.gb, n._crypto_ipcrypt_ndx_tweakbytes = e.hb, n._crypto_ipcrypt_ndx_inputbytes = e.ib, n._crypto_ipcrypt_ndx_outputbytes = e.jb, n._crypto_ipcrypt_pfx_keybytes = e.kb, n._crypto_ipcrypt_pfx_bytes = e.lb, n._crypto_ipcrypt_keygen = e.mb, n._crypto_ipcrypt_nd_keygen = e.nb, n._crypto_ipcrypt_ndx_keygen = e.ob, n._crypto_ipcrypt_pfx_keygen = e.pb, n._crypto_ipcrypt_encrypt = e.qb, n._crypto_ipcrypt_decrypt = e.rb, n._crypto_ipcrypt_nd_encrypt = e.sb, n._crypto_ipcrypt_nd_decrypt = e.tb, n._crypto_ipcrypt_ndx_encrypt = e.ub, n._crypto_ipcrypt_ndx_decrypt = e.vb, n._crypto_ipcrypt_pfx_encrypt = e.wb, n._crypto_ipcrypt_pfx_decrypt = e.xb, n._crypto_kdf_bytes_min = e.yb, n._crypto_kdf_bytes_max = e.zb, n._crypto_kdf_contextbytes = e.Ab, n._crypto_kdf_keybytes = e.Bb, n._crypto_kdf_derive_from_key = e.Cb, n._crypto_kdf_keygen = e.Db, n._crypto_kdf_hkdf_sha256_extract_init = e.Eb, n._crypto_kdf_hkdf_sha256_extract_update = e.Fb, n._crypto_kdf_hkdf_sha256_extract_final = e.Gb, n._crypto_kdf_hkdf_sha256_extract = e.Hb, n._crypto_kdf_hkdf_sha256_keygen = e.Ib, n._crypto_kdf_hkdf_sha256_expand = e.Jb, n._crypto_kdf_hkdf_sha256_keybytes = e.Kb, n._crypto_kdf_hkdf_sha256_bytes_min = e.Lb, n._crypto_kdf_hkdf_sha256_bytes_max = e.Mb, n._crypto_kdf_hkdf_sha256_statebytes = e.Nb, n._crypto_kdf_hkdf_sha512_extract_init = e.Ob, n._crypto_kdf_hkdf_sha512_extract_update = e.Pb, n._crypto_kdf_hkdf_sha512_extract_final = e.Qb, n._crypto_kdf_hkdf_sha512_extract = e.Rb, n._crypto_kdf_hkdf_sha512_keygen = e.Sb, n._crypto_kdf_hkdf_sha512_expand = e.Tb, n._crypto_kdf_hkdf_sha512_keybytes = e.Ub, n._crypto_kdf_hkdf_sha512_bytes_min = e.Vb, n._crypto_kdf_hkdf_sha512_bytes_max = e.Wb, n._crypto_kdf_hkdf_sha512_statebytes = e.Xb, n._crypto_kem_publickeybytes = e.Yb, n._crypto_kem_secretkeybytes = e.Zb, n._crypto_kem_ciphertextbytes = e._b, n._crypto_kem_sharedsecretbytes = e.$b, n._crypto_kem_seedbytes = e.ac, n._crypto_kem_primitive = e.bc, n._crypto_kem_seed_keypair = e.cc, n._crypto_kem_keypair = e.dc, n._crypto_kem_enc = e.ec, n._crypto_kem_dec = e.fc, n._crypto_kem_mlkem768_publickeybytes = e.gc, n._crypto_kem_mlkem768_secretkeybytes = e.hc, n._crypto_kem_mlkem768_ciphertextbytes = e.ic, n._crypto_kem_mlkem768_sharedsecretbytes = e.jc, n._crypto_kem_mlkem768_seedbytes = e.kc, n._crypto_kem_mlkem768_seed_keypair = e.lc, n._crypto_kem_mlkem768_keypair = e.mc, n._crypto_kem_mlkem768_enc = e.nc, n._crypto_kem_mlkem768_enc_deterministic = e.oc, n._crypto_kem_mlkem768_dec = e.pc, n._crypto_kem_xwing_publickeybytes = e.qc, n._crypto_kem_xwing_secretkeybytes = e.rc, n._crypto_kem_xwing_ciphertextbytes = e.sc, n._crypto_kem_xwing_sharedsecretbytes = e.tc, n._crypto_kem_xwing_seedbytes = e.uc, n._crypto_kem_xwing_seed_keypair = e.vc, n._crypto_kem_xwing_keypair = e.wc, n._crypto_kem_xwing_enc_deterministic = e.xc, n._crypto_kem_xwing_enc = e.yc, n._crypto_kem_xwing_dec = e.zc, n._crypto_kx_seed_keypair = e.Ac, n._crypto_kx_keypair = e.Bc, n._crypto_kx_client_session_keys = e.Cc, n._crypto_kx_server_session_keys = e.Dc, n._crypto_kx_publickeybytes = e.Ec, n._crypto_kx_secretkeybytes = e.Fc, n._crypto_kx_seedbytes = e.Gc, n._crypto_kx_sessionkeybytes = e.Hc, n._crypto_scalarmult_base = e.Ic, n._crypto_scalarmult = e.Jc, n._crypto_scalarmult_bytes = e.Kc, n._crypto_scalarmult_scalarbytes = e.Lc, n._crypto_secretbox_keybytes = e.Mc, n._crypto_secretbox_noncebytes = e.Nc, n._crypto_secretbox_macbytes = e.Oc, n._crypto_secretbox_messagebytes_max = e.Pc, n._crypto_secretbox_keygen = e.Qc, n._crypto_secretbox_detached = e.Rc, n._crypto_secretbox_easy = e.Sc, n._crypto_secretbox_open_detached = e.Tc, n._crypto_secretbox_open_easy = e.Uc, n._crypto_secretstream_xchacha20poly1305_keygen = e.Vc, n._crypto_secretstream_xchacha20poly1305_init_push = e.Wc, n._crypto_secretstream_xchacha20poly1305_init_pull = e.Xc, n._crypto_secretstream_xchacha20poly1305_rekey = e.Yc, n._crypto_secretstream_xchacha20poly1305_push = e.Zc, n._crypto_secretstream_xchacha20poly1305_pull = e._c, n._crypto_secretstream_xchacha20poly1305_statebytes = e.$c, n._crypto_secretstream_xchacha20poly1305_abytes = e.ad, n._crypto_secretstream_xchacha20poly1305_headerbytes = e.bd, n._crypto_secretstream_xchacha20poly1305_keybytes = e.cd, n._crypto_secretstream_xchacha20poly1305_messagebytes_max = e.dd, n._crypto_secretstream_xchacha20poly1305_tag_message = e.ed, n._crypto_secretstream_xchacha20poly1305_tag_push = e.fd, n._crypto_secretstream_xchacha20poly1305_tag_rekey = e.gd, n._crypto_secretstream_xchacha20poly1305_tag_final = e.hd, n._crypto_shorthash_bytes = e.id, n._crypto_shorthash_keybytes = e.jd, n._crypto_shorthash = e.kd, n._crypto_shorthash_keygen = e.ld, n._crypto_sign_statebytes = e.md, n._crypto_sign_bytes = e.nd, n._crypto_sign_seedbytes = e.od, n._crypto_sign_publickeybytes = e.pd, n._crypto_sign_secretkeybytes = e.qd, n._crypto_sign_messagebytes_max = e.rd, n._crypto_sign_seed_keypair = e.sd, n._crypto_sign_keypair = e.td, n._crypto_sign = e.ud, n._crypto_sign_open = e.vd, n._crypto_sign_detached = e.wd, n._crypto_sign_verify_detached = e.xd, n._crypto_sign_init = e.yd, n._crypto_sign_update = e.zd, n._crypto_sign_final_create = e.Ad, n._crypto_sign_final_verify = e.Bd, n._crypto_sign_ed25519_pk_to_curve25519 = e.Cd, n._crypto_sign_ed25519_sk_to_curve25519 = e.Dd, n._crypto_xof_shake128_blockbytes = e.Ed, n._crypto_xof_shake128_statebytes = e.Fd, n._crypto_xof_shake128_domain_standard = e.Gd, n._crypto_xof_shake128 = e.Hd, n._crypto_xof_shake128_init = e.Id, n._crypto_xof_shake128_init_with_domain = e.Jd, n._crypto_xof_shake128_update = e.Kd, n._crypto_xof_shake128_squeeze = e.Ld, n._crypto_xof_shake256_blockbytes = e.Md, n._crypto_xof_shake256_statebytes = e.Nd, n._crypto_xof_shake256_domain_standard = e.Od, n._crypto_xof_shake256 = e.Pd, n._crypto_xof_shake256_init = e.Qd, n._crypto_xof_shake256_init_with_domain = e.Rd, n._crypto_xof_shake256_update = e.Sd, n._crypto_xof_shake256_squeeze = e.Td, n._crypto_xof_turboshake128_blockbytes = e.Ud, n._crypto_xof_turboshake128_statebytes = e.Vd, n._crypto_xof_turboshake128_domain_standard = e.Wd, n._crypto_xof_turboshake128 = e.Xd, n._crypto_xof_turboshake128_init = e.Yd, n._crypto_xof_turboshake128_init_with_domain = e.Zd, n._crypto_xof_turboshake128_update = e._d, n._crypto_xof_turboshake128_squeeze = e.$d, n._crypto_xof_turboshake256_blockbytes = e.ae, n._crypto_xof_turboshake256_statebytes = e.be, n._crypto_xof_turboshake256_domain_standard = e.ce, n._crypto_xof_turboshake256 = e.de, n._crypto_xof_turboshake256_init = e.ee, n._crypto_xof_turboshake256_init_with_domain = e.fe, n._crypto_xof_turboshake256_update = e.ge, n._crypto_xof_turboshake256_squeeze = e.he, n._randombytes_random = e.ie, n._randombytes_stir = e.je, n._randombytes_uniform = e.ke, n._randombytes_buf = e.le, n._randombytes_buf_deterministic = e.me, n._randombytes_seedbytes = e.ne, n._randombytes_close = e.oe, n._randombytes = e.pe, n._sodium_bin2hex = e.qe, n._sodium_hex2bin = e.re, n._sodium_base64_encoded_len = e.se, n._sodium_bin2base64 = e.te, n._sodium_base642bin = e.ue, n._sodium_ip2bin = e.ve, n._sodium_bin2ip = e.we, n._sodium_init = e.xe, n._sodium_pad = e.ye, n._sodium_unpad = e.ze, n._sodium_version_string = e.Ae, n._sodium_library_version_major = e.Be, n._sodium_library_version_minor = e.Ce, n._sodium_library_minimal = e.De, n._malloc = e.Ee, n._free = e.Fe, e.dynCall_iiiji, e.dynCall_iiij, e.dynCall_iijii, e.dynCall_iiijiji, e.dynCall_iiijiii, fe = e.e, e.__indirect_function_table;
			}(S = e.exports), b(), S;
		}
		var r = { a: me };
		return n.instantiateWasm ? new Promise((t, i) => {
			n.instantiateWasm(r, (n, r) => {
				t(e(n));
			});
		}) : (l ??= ((e) => {
			for (var t, n, r = 0, i = 0, a = 295748, o = new Uint8Array(221811 - (e[295746] == "=") - (e[295747] == "=")); r < a; r += 4, i += 3) t = ue[e.charCodeAt(r + 1)], n = ue[e.charCodeAt(r + 2)], o[i] = ue[e.charCodeAt(r)] << 2 | t >> 4, o[i + 1] = t << 4 | n >> 2, o[i + 2] = n << 6 | ue[e.charCodeAt(r + 3)];
			return o;
		})("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IgMgATQCGCIGfnwgAigCCCIsrCINIAE0AhAiB358IAIoAgwiLawiECABKAIMIi5BAXSsIhV+fCACKAIQIi+sIhEgATQCCCIIfnwgAigCFCIwrCIWIAEoAgQiMUEBdKwiF358IAIoAhgiMqwiICABNAIAIgl+fCACKAIcIjNBE2ysIgwgASgCJCI0QQF0rCIYfnwgAigCICI1QRNsrCIEIAE0AiAiCn58IAIoAiQiAkETbKwiBSABKAIcIgFBAXSsIhl+fCAHIAt+IAMgK6wiGn58IA0gLqwiG358IAggEH58IBEgMawiHH58IAkgFn58IDJBE2ysIg4gNKwiHX58IAogDH58IAQgAawiHn58IAUgBn58IAsgFX4gAyAHfnwgCCANfnwgECAXfnwgCSARfnwgMEETbKwiHyAYfnwgCiAOfnwgDCAZfnwgBCAGfnwgBSAUfnwiIkKAgIAQfCIjQhqHfCIkQoCAgAh8IiVCGYd8IhIgEkKAgIAQfCITQoCAgOAPg30+AhggACALIBd+IAMgCH58IAkgDX58IC1BE2ysIg8gGH58IAogL0ETbKwiEn58IBkgH358IAYgDn58IAwgFH58IAQgB358IAUgFX58IAkgC34gAyAcfnwgLEETbKwiISAdfnwgCiAPfnwgEiAefnwgBiAffnwgDiAafnwgByAMfnwgBCAbfnwgBSAIfnwgKkETbKwgGH4gAyAJfnwgCiAhfnwgDyAZfnwgBiASfnwgFCAffnwgByAOfnwgDCAVfnwgBCAIfnwgBSAXfnwiIUKAgIAQfCImQhqHfCInQoCAgAh8IihCGYd8Ig8gD0KAgIAQfCIpQoCAgOAPg30+AgggACAGIAt+IAMgHn58IA0gGn58IAcgEH58IBEgG358IAggFn58IBwgIH58IAkgM6wiD358IAQgHX58IAUgCn58IBNCGod8IhMgE0KAgIAIfCITQoCAgPAPg30+AhwgACAIIAt+IAMgG358IA0gHH58IAkgEH58IBIgHX58IAogH358IA4gHn58IAYgDH58IAQgGn58IAUgB358IClCGod8IgQgBEKAgIAIfCIEQoCAgPAPg30+AgwgACALIBl+IAMgCn58IAYgDX58IBAgFH58IAcgEX58IBUgFn58IAggIH58IA8gF358IAkgNawiDH58IAUgGH58IBNCGYd8IgUg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IAZSDQALCyAAIAsgDCAMQYAFaiINEDsgASAFp2ohASACIAV9IgJC/wBWBEADQCAAIAEgDCANEDsgAUGAAWohASACQoABfSICQv8AVg0ACwsCQCACUA0AIAJCA4MhBEIAIQdCACEDIAJCBFoEQCACQvwAgyEFQgAhAgNAIAsgA6ciAGogACABai0AADoAACALIABBAXIiDWogASANai0AADoAACALIABBAnIiDWogASANai0AADoAACALIABBA3IiAGogACABai0AADoAACADQgR8IQMgAkIEfCICIAVSDQALIARQDQELA0AgCyADpyIAaiAAIAFqLQAAOgAAIANCAXwhAyAHQgF8IgcgBFINAAsLIAxBwAUQBwwBCyACQgODIQVCACEDIAJCBFoEQCACQnyDIQIDQCALIAMgBHynaiABIAOnai0AADoAACALIANCAYQiBiAEfKdqIAEgBqdqLQAAOgAAIAsgA0IChCIGIAR8p2ogASAGp2otAAA6AAAgCyADQgOEIgYgBHynaiABIAanai0AADoAACADQgR8IQMgCUIEfCIJIAJSDQALIAVQDQELA0AgCyADIAR8p2ogASADp2otAAA6AAAgA0IBfCEDIAdCAXwiByAFUg0ACwsgDEHABWokAEEAC6UFAQN/IwBBsAFrIgIkACACIAEoAAA2AgBBBCEDIAIgASgABDYCBCACIAEoAAg2AgggAiABKAAMIgE2AgwDQCACIANBAnRqIgQgA0EDcQR/IAEFIANBAnZB8IgCai0AACABQRh3IgFBCHZB/wFxQYCrAmotAABBCHQgAUH/AXFBgKsCai0AAHIgAUEQdkH/AXFBgKsCai0AAEEQdHIgAUEYdkGAqwJqLQAAQRh0cnMLIARBEGsoAgBzIgE2AgAgA0EBaiIDQSxHDQALIAAgAigCADYCACAAIAIoAgQ2AgQgACACKAIINgIIIAAgAigCDDYCDCAAIAIoAhA2AhAgACACKAIUNgIUIAAgAigCGDYCGCAAIAIoAhw2AhwgACACKAIgNgIgIAAgAigCJDYCJCAAIAIoAig2AiggACACKAIsNgIsIAAgAigCMDYCMCAAIAIoAjQ2AjQgACACKAI4NgI4IAAgAigCPDYCPCAAQUBrIAIoAkA2AgAgACACKAJENgJEIAAgAigCSDYCSCAAIAIoAkw2AkwgACACKAJQNgJQIAAgAigCVDYCVCAAIAIoAlg2AlggACACKAJcNgJcIAAgAigCYDYCYCAAIAIoAmQ2AmQgACACKAJoNgJoIAAgAigCbDYCbCAAIAIoAnA2AnAgACACKAJ0NgJ0IAAgAigCeDYCeCAAIAIoAnw2AnwgACACKAKAATYCgAEgACACKAKEATYChAEgACACKAKIATYCiAEgACACKAKMATYCjAEgACACKAKQATYCkAEgACACKAKUATYClAEgACACKAKYATYCmAEgACACKAKcATYCnAEgACACKAKgATYCoAEgACACKAKkATYCpAEgACACKAKoATYCqAEgACACKAKsATYCrAEgAkGwAWokAAufBAETfyABKAIoIQIgASgCBCEDIAEoAiwhBCABKAIIIQUgASgCMCEGIAEoAgwhByABKAI0IQggASgCECEJIAEoAjghCiABKAIUIQsgASgCPCEMIAEoAhghDSABQUBrIg4oAgAhDyABKAIcIRAgASgCRCERIAEoAiAhEiABKAJIIRMgASgCACEUIAAgASgCJCABKAJMajYCJCAAIBIgE2o2AiAgACAQIBFqNgIcIAAgDSAPajYCGCAAIAsgDGo2AhQgACAJIApqNgIQIAAgByAIajYCDCAAIAUgBmo2AgggACADIARqNgIEIAAgAiAUajYCACABKAIoIQIgASgCBCEDIAEoAiwhBCABKAIIIQUgASgCMCEGIAEoAgwhByABKAI0IQggASgCECEJIAEoAjghCiABKAIUIQsgASgCPCEMIAEoAhghDSAOKAIAIQ4gASgCHCEPIAEoAkQhECABKAIgIREgASgCSCESIAEoAgAhEyAAIAEoAkwgASgCJGs2AkwgACASIBFrNgJIIAAgECAPazYCRCAAQUBrIA4gDWs2AgAgACAMIAtrNgI8IAAgCiAJazYCOCAAIAggB2s2AjQgACAGIAVrNgIwIAAgBCADazYCLCAAIAIgE2s2AiggACABKQJQNwJQIAAgASkCWDcCWCAAIAEpAmA3AmAgACABKQJoNwJoIAAgASkCcDcCcCAAQfgAaiABQfgAakGgCxAGC/AJAR5/IAEoAighAyABKAIEIQQgASgCLCEFIAEoAgghBiABKAIwIQcgASgCDCEIIAEoAjQhCSABKAIQIQogASgCOCELIAEoAhQhDCABKAI8IQ0gASgCGCEOIAFBQGsiDygCACEQIAEoAhwhESABKAJEIRIgASgCICETIAEoAkghFCABKAIAIRUgACABKAIkIAEoAkxqNgIkIAAgEyAUajYCICAAIBEgEmo2AhwgACAOIBBqNgIYIAAgDCANajYCFCAAIAogC2o2AhAgACAIIAlqNgIMIAAgBiAHajYCCCAAIAQgBWo2AgQgACADIBVqNgIAIAEoAighBSABKAIEIQMgASgCLCEGIAEoAgghByABKAIwIQggASgCDCEJIAEoAjQhCiABKAIQIQsgASgCOCEMIAEoAhQhDSABKAI8IQ4gASgCGCEQIA8oAgAhDyABKAIcIQQgASgCRCERIAEoAiAhEiABKAJIIRMgASgCACEUIAAgASgCTCABKAIkazYCTCAAIBMgEms2AkggACARIARrNgJEIABBQGsiBCAPIBBrNgIAIAAgDiANazYCPCAAIAwgC2s2AjggACAKIAlrNgI0IAAgCCAHazYCMCAAIAYgA2s2AiwgAEEoaiIDIAUgFGs2AgAgAEHQAGogACACEAYgAyADIAJBKGoQBiAAQfgAaiACQfgAaiABQfgAahAGIAAgAUHQAGogAkHQAGoQBiAAKAIEIRUgACgCCCEWIAAoAgwhFyAAKAIQIRggACgCFCEZIAAoAhghGiAAKAIcIRsgACgCICEcIAAoAiQhHSADKAIAIQEgACgCUCECIAAoAiwhBSAAKAJUIQYgACgCMCEHIAAoAlghCCAAKAI0IQkgACgCXCEKIAAoAjghCyAAKAJgIQwgACgCPCENIAAoAmQhDiAEKAIAIQ8gACgCaCEQIAAoAkQhESAAKAJsIRIgACgCSCETIAAoAnAhFCAAKAIAIR4gACAAKAJMIh8gACgCdCIgajYCTCAAIBMgFGo2AkggACARIBJqNgJEIAQgDyAQajYCACAAIA0gDmo2AjwgACALIAxqNgI4IAAgCSAKajYCNCAAIAcgCGo2AjAgACAFIAZqNgIsIAMgASACajYCACAAICAgH2s2AiQgACAUIBNrNgIgIAAgEiARazYCHCAAIBAgD2s2AhggACAOIA1rNgIUIAAgDCALazYCECAAIAogCWs2AgwgACAIIAdrNgIIIAAgBiAFazYCBCAAIAIgAWs2AgAgACAdQQF0IgEgACgCnAEiAms2ApwBIAAgHEEBdCIDIAAoApgB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QQA2AuABIABBADoA7AFBfwVBAAsgBQRAIAAoAuABIQMDQCAAKALkASIEIANGBEAgABAOIABBADYC4AEgACgC5AEhBEEAIQMLIAAgASAGaiADIAQgA2siAyAFIAZrIgQgAyAESRsiBBANIAAgACgC4AEgBGoiAzYC4AEgBCAGaiIGIAVJDQALCwvoAQIGfwJ+An8gAkIAUgRAIABB4AFqIQggAEHgAGohBCAAKADgAiEFIABBQGshBgNAIAQgBWohB0GAAiAFayIDrSIJIAJaBEAgAqciAwRAIAcgASAD/AoAAAsgACAAKADgAiADajYA4AJBAAwDCyADBEAgByABIAP8CgAACyAAIAAoAOACIANqNgDgAiAGIAYpAAAiCkKAAXw3AAAgACAAKQBIIApC/35WrXw3AEggACAEEDwgBCAIQYAB/AoAACAAIAAoAOACQYABayIFNgDgAiABIANqIQEgAiAJfSICQgBSDQALC0EACwvoBAEJfyAAIAEoAiAiBSABKAIcIgYgASgCGCIHIAEoAhQiCCABKAIQIgkgASgCDCIKIAEoAggiBCABKAIEIgMgASgCACICIAEoAiQiAUETbEGAgIAIakEZdmpBGnVqQRl1akEadWpBGXVqQRp1akEZdWpBGnVqQRl1akEadSABakEZdUETbCACaiICOgAAIAAgAkEQdjoAAiAAIAJBCHY6AAEgACADIAJBGnVqIgNBDnY6AAUgACADQQZ2OgAEIAAgAkEYdkEDcSADQQJ0cjoAAyAAIAQgA0EZdWoiAkENdjoACCAAIAJBBXY6AAcgACACQQN0IANBgICADnFBFnZyOgAGIAAgCiACQRp1aiIEQQt2OgALIAAgBEEDdjoACiAAIARBBXQgAkGAgIAfcUEVdnI6AAkgACAJIARBGXVqIgJBEnY6AA8gACACQQp2OgAOIAAgAkECdjoADSAAIAggAkEadWoiAzoAECAAIAJBBnQgBEGAgOAPcUETdnI6AAwgACADQRB2OgASIAAgA0EIdjoAESAAIAcgA0EZdWoiAkEPdjoAFSAAIAJBB3Y6ABQgACADQRh2QQFxIAJBAXRyOgATIAAgBiACQRp1aiIDQQ12OgAYIAAgA0EFdjoAFyAAIANBA3QgAkGAgIAccUEXdnI6ABYgACAFIANBGXVqIgJBDHY6ABsgACACQQR2OgAa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LQAAczoAACADQQRqIQMgCEEEaiIIIAJHDQALIAdFDQELA0AgBEFAayADaiIAIAAtAAAgASADai0AAHM6AAAgA0EBaiEDIApBAWoiCiAHRw0ACwsgCSAEQUBrIgBCgAEQEBogAEGAARAHIARBwAAQByAEQcABaiQAQQAPCxAKAAuVAQEBfyMAQdABayIDJAAgA0IANwNIIANCADcDQCADQZCtAikDADcDACADQZitAikDADcDCCADQaCtAikDADcDECADQaitAikDADcDGCADQbCtAikDADcDICADQbitAikDADcDKCADQcCtAikDADcDMCADQcitAikDADcDOCADIAEgAhAQGiADIAAQHCADQdABaiQAQQALVwIBfwF+AkBBsLkCKAIAIgGtIACtQgd8Qvj///8fg3wiAkL/////D1gEQCACpyIAPwBBEHRNDQEgABADDQELQdDAAkEwNgIAQX8PC0GwuQIgADYCACABCzoBAn8jAEEgayIDJABBfyEEIAMgAiABEClFBEAgAEGguQIgAxBfIANBIBAHQQAhBAsgA0EgaiQAIAQLBABBbwuiAwIDfwF+IwBB4AJrIgYkACAGIAQgBRBfAn8CQAJAIAAgAksgAyAAIAJrrVZxRQRAIAAgAk8NASADIAIgAGutWA0BCyADpyIFBEAgACACIAX8CgAACyAGQgA3AzggBkIANwMwIAZCADcDKCAGQgA3AyBCICADIANCIFobIQkgA0IgViEFIAAhAgwBCyAGQgA3AzggBkIANwMwIAZCADcDKCAGQgA3AyBCICADIANCIFobIQkgA0IgViEFIANCAFINAEEBDAELIAmnIgcEQCAGQUBrIAIgB/wKAAALQQALIQggBkEgaiIHIAcgCUIgfCAEQRBqIgRCACAGQdS5AigCABEPABogBkHgAGogB0G8uQIoAgARAQAaAkAgCA0AIAmnIgdFDQAgACAGQUBrIAf8CgAACyAGQSBqQcAAEAcgBQRAIAAgCaciBWogAiAFaiADIAl9IARCASAGQdS5AigCABEPABoLIAZBIBAHIAZB4ABqIgIgACADQcC5AigCABEAABogAiABQcS5AigCABEBABogAkGAAhAHIAZB4AJqJABBAAuHGAEOf0H/ACECA0AgACABQQF0aiIDIAMuAQQiBCADLgEAIgZqIgXBQb+dAWxBGnVB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IAEgA6dqLQAAOgAAIANCAXwhAyAHQgF8IgcgBlINAAsLIAAgCyAMIAxBgAJqIg0QTyABIAWnaiEBIAIgBX0iAkI/VgRAA0AgACABIAwgDRBPIAFBQGshASACQkB8IgJCP1YNAAsLAkAgAlANACACQgODIQRCACEHQgAhAyACQgRaBEAgAkI8gyEFQgAhAgNAIAsgA6ciAGogACABai0AADoAACALIABBAXIiDWogASANai0AADoAACALIABBAnIiDWogASANai0AADoAACALIABBA3IiAGogACABai0AADoAACADQgR8IQMgAkIEfCICIAVSDQALIARQDQELA0AgCyADpyIAaiAAIAFqLQAAOgAAIANCAXwhAyAHQgF8IgcgBFINAAsLIAxBoAIQBwwBCyACQgODIQVCACEDIAJCBFoEQCACQnyDIQIDQCALIAMgBHynaiABIAOnai0AADoAACALIANCAYQiBiAEfKdqIAEgBqdqLQAAOgAAIAsgA0IChCIGIAR8p2ogASAGp2otAAA6AAAgCyADQgOEIgYgBHynaiABIAanai0AADoAACADQgR8IQMgCUIEfCIJIAJSDQALIAVQDQELA0AgCyADIAR8p2ogASADp2otAAA6AAAgA0IBfCEDIAdCAXwiByAFUg0ACwsgDEGgAmokAAsEAEEYC+kDAQJ/QX8hBQJAIAJBwABLDQAgA0HBAGsiBEFASQ0AAkAgAUEAIAIbRQRAIARB/wFxQb8BTQRAEAoACyAAQUBrQQBBpQL8CwAgAEL5wvibkaOz8NsANwA4IABC6/qG2r+19sEfNwAwIABCn9j52cKR2oKbfzcAKCAAQtGFmu/6z5SH0QA3ACAgAELx7fT4paf9p6V/NwAYIABCq/DT9K/uvLc8NwAQIABCu86qptjQ67O7fzcACCAAIAOtQoiS95X/zPmE6gCFNwAADAELAn8jAEGAAWsiBCQAAkAgA0HBAGtB/wFxQb8BTQ0AIAFFDQAgAkHBAGtB/wFxQb8BTQ0AIABBQGtBAEGlAvwLACAAQvnC+JuRo7Pw2wA3ADggAELr+obav7X2wR83ADAgAEKf2PnZwpHagpt/NwAoIABC0YWa7/rPlIfRADcAICAAQvHt9Pilp/2npX83ABggAEKr8NP0r+68tzw3ABAgAEK7zqqm2NDrs7t/NwAIIAAgA60g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GiABKAAUIRsgASgAGCEcIAEoABwhLCABKAAgIS0gASgAJCEuIAEoACghLyABKAAsITAgASgAMCExIAEoADQhMiABKAA4ITMgASgAPCE0IAUgASgAACAIICpqczYAACAFIDQgECAdanM2ADwgBSAzIBcgHmpzNgA4IAUgMiASIBhqczYANCAFIDEgDSATanM2ADAgBSAwIBEgH2pzNgAsIAUgLyAMICBqczYAKCAFIC4gDyAhanM2ACQgBSAtIAsgImpzNgAgIAUgLCAHICNqczYAHCAFIBwgBiAkanM2ABggBSAbIAIgJWpzNgAUIAUgGiAEICZqczYAECAFIBkgFCAnanM2AAwgBSAVIA4gKGpzNgAIIAUgFiAKIClqczYABCASIBNBAWoiE0VqIRIgA0LAAFgEQCADQj9YBEAgA6chAUEAIQQDQCAEICtqIAQgBWotAAA6AAAgBEEBaiIEIAFJDQALCyAAIBI2AjQgACATNgIwBSABQUBrIQEgBUFAayECIANCQHwhAwwBCwsLCAAgAEEQEBUL0QYBCn8jAEGgAmsiAiQAIAAoABwhBCAAKAAYIQUgACgAFCEGIAAoABAhByAAKAAEIQggACgACCEJIAAoAAwhCiAAKAAAIQsgAiABKQJ4NwOYAiACIAEpAnA3A5ACIAIgASkCYDcD8AEgAiABKQJoNwP4ASACIAEpAnA3A+ABIAIgASkCeDcD6AEgAkGAAmoiAyACQfABaiACQeABahAFIAEgAikCiAI3AnggASACKQKAAjcCcCACIAEpAlA3A9ABIAIgASkCWDcD2AEgAiABKQJgNwPAASACIAEpAmg3A8gBIAMgAkHQAWogAkHAAWoQBSABIAIpAogCNwJoIAEgAikCgAI3AmAgAiABQUBrIgApAgA3A7ABIAIgASkCSDcDuAEgAiABKQJQNwOgASACIAEpAlg3A6gBIAMgAkGwAWogAkGgAWoQBSABIAIpAogCNwJYIAEgAikCgAI3AlAgAiABKQIwNwOQASACIAEpAjg3A5gBIAIgACkCADcDgAEgAiABKQJINwOIASADIAJBkAFqIAJBgAFqEAUgASACKQKIAjcCSCAAIAIpAoACNwIAIAIgASkCIDcDcCACIAEpAig3A3ggAiABKQIwNwNgIAIgASkCODcDaCADIAJB8ABqIAJB4ABqEAUgASAC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IiAKIAUgBBAGIAJBkANqIgEgByADEAYgAkG4A2oiBiADIAQQBiAFIAoQIiAKIAUgBBAGIAEgByADEAYgBiADIAQQBiAFIAoQIiAKIAUgBBAGIAEgByADEAYgBiADIAQQBiAFIAoQIiAAIAUgBBAGIAggByADEAYgCSADIAQQBiALIAUgBxAGQQAhAQNAIAJBCGoiBiABQQF2IAJBoAJqIAFqLAAAEHYgAkGAAWoiBSAAIAYQWSAAIAUgBBAGIAggByADEAYgCSADIAQQBiALIAUgBxAGIAFBPkkgAUECaiEBDQALIAJB4ANqJAALYgEDfyMAQbABayICJAAgAkHgAGoiAyABQdAAahBEIAJBMGoiBCABIAMQBiACIAFBKGogAxAGIAAgAhAaIAJBkAFqIAQQGiAAIAAtAB8gAi0AkAFBB3RzOgAfIAJBsAFqJAALyggBA38jAEHAAWsiAiQAIAJBkAFqIgQgARAEIAJB4ABqIgMgBBAEIAMgAxAEIAMgASADEAYgBCAEIAMQBiACQTBqIgEgBBAEIAMgAyABEAYgASADEAQgASABEAQgASABEAQgASABEAQgASABEAQgAyABIAMQBiABIAMQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEgAxAGIAIgARAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAEgAiABEAYgASABEAQgASABEAQgASABEAQgASABEAQgASABEAQgASABEAQgASABEAQgASABEAQgASABEAQgASABEAQgAyABIAMQBiABIAMQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEQBCABIAEgAxAGIAIgARAEQQEhAQNAIAIgAhAEIAFBAWoiAUHkAEcNAAsgAkEwaiIBIAIgARAGIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAEgARAEIAJB4ABqIgMgASADEAYgAyADEAQgAyADEAQgAyADEAQgAyADEAQgAyADEAQgACADIAJBkAFqEAYgAkHAAWokAAv8AgIDfwF+IwBB4ABrIgYkACAGIAQgBRBfIAZBIGoiBUIgIARBEGoiBCAGQdC5AigCABERABoCfyACIAEgAyAFQbi5AigCABEWAARAIAZBIBAHQX8MAQsCQCAARQRAIAZBIBAHIAZBIGpBwAAQBwwBCwJAAkACQAJAIAAgAUkgAyABIABrrVZxRQRAIAAgAU0NASADIAAgAWutWA0BCyADpyICBEAgACABIAL8CgAACyAAIQEMAQsgA1ANAQsgBkFAayEFQiAgAyADQiBaGyIJpyICRSIHRQRAIAUgASAC/AoAAAsgBkEgaiIIIAggCUIgfCAEQgAgBkHUuQIoAgARDwAaIAdFBEAgACAFIAL8CgAACyAGQSBqQcAAEAcgA0IhVA0BIAAgAmogASACaiADIAl9IARCASAGQdS5AigCABEPABoMAQsgBkEgaiIAIABCICAEQgAgBkHUuQIoAgARDwAaIABBwAAQBwsg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BEAgAxAOIANBADYC4AEgAygC5AEhBEEAIQULIAMgASAGaiAFIAQgBWsiBSAHIAZrIgQgBCAFSxsiBBANIAMgAygC4AEgBGoiBTYC4AEgBCAGaiIGIAdJDQALCyADIAAQNhogA0GAAhAHIANBgAJqJABBAAuxAQEBfyMAQRBrIgIgADYCDCACIAE2AghBACEAIAJBADsBBgNAIAIgAi8BBiACKAIMIABqLQAAIAIoAgggAGotAABzcjsBBiACIAIvAQYgAEEBciIBIAIoAgxqLQAAIAIoAgggAWotAABzcjsBBiAAQQJqIgBBIEcNAAsgAiACLwEGOwEGIAIgAi8BBkEBazsBBiACQeDEAi8BAEECdiACLwEGQQ92czsBBiACLwEGQQFrCzQBAX8jAEEgayICJAAgACACEGUgAEHoAGoiACACQiAQNyAAIAEQZSACQSAQByACQSBqJAAL4gcBCX8jAEHgAGsiAyQAAkACQCACQcEATwRAIABCADcDICAAQeCzAikDADcDACAAQeizAikDADcDCCAAQfCzAikDADcDECAAQfizAikDADcDGCAAIAEgAq0QNyAAIAMQZUEgIQIgAyEBDAELIAENACACDQELIABCADcDICAAQeCzAikDADcDACAAQeizAikDADcDCCAAQfCzAikDADcDECAAQfizAikDADcDGCADQrbs2LHjxo2bNjcDWCADQrbs2LHjxo2bNjcDUCADQrbs2LHjxo2bNjcDSCADQrbs2LHjxo2bNjcDQCADQrbs2LHjxo2bNjcDOCADQrbs2LHjxo2bNjcDMCADQrbs2LHjxo2bNjcDKCADQrbs2LHjxo2bNjcDIAJAIAJFDQAgAkEDcSEJIAJBBE8EQCACQfwAcSEGA0AgA0EgaiIHIARqIgUgBS0AACABIARqLQAAczoAACAHIARBAXIiBWoiCyALLQAAIAEgBWotAABzOgAAIAcgBEECciIFaiILIAstAAAgASAFai0AAHM6AAAgByAEQQNyIgVqIgcgBy0AACABIAVqLQAAczoAACAEQQRqIQQgCEEEaiIIIAZHDQALIAlFDQELA0AgA0EgaiAEaiIIIAgtAAAgASAEai0AAHM6AAAgBEEBaiEEIApBAWoiCiAJRw0ACwsgACADQSBqQsAAEDcgAEHoAGoiCSIAQgA3AyAgAEHgswIpAwA3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EAghAyAAIAAoAmwQCDYCbCAAIAM2AmggACACNgJkIAAgATYCYCAAKAJwEAghASAAKAJ0EAghAiAAKAJ4EAghAyAAIAAoAnwQCDYCfCAAIAM2AnggACACNgJ0IAAgATYCcCAAKAKAARAIIQEgACgChAEQCCECIAAoAogBEAghAyAAIAAoAowBEAg2AowBIAAgAzYCiAEgACACNgKEASAAIAE2AoABIAAoApABEAghASAAKAKUARAIIQIgACgCmAEQCCEDIAAgACgCnAEQCDYCnAEgACADNgKYASAAIAI2ApQBIAAgATYCkAEL9xICFX4DfyAAIAAoACwiFkEFdkH///8Aca0gACgAPEEDdq0iAkKDoVZ+IAAzACogADEALEIQhkKAgPwAg4R8IgtCgIBAfSIIQhWHfCIBQoOhVn4gADUAMUIHiEL///8AgyIDQtOMQ34gACgAFyIXQRh2rSAAMQAbQgiGhCAAMQAcQhCGhEICiEL///8Ag3wgACgANCIYQQR2Qf///wBxrSIEQuf2J358IBZBGHatIAAxADBCCIaEIAAxADFCEIaEQgKIQv///wCDIgVC0asIfnwgADUAOUIGiEL///8AgyIGQpPYKH58IBhBGHatIAAxADhCCIaEIAAxADlCEIaEQgGIQv///wCDIglCmNocfnwiB3wgB0KAgEB9IhFCgICAf4N9IBdBBXZB////AHGtIANC5/YnfnwgBEKY2hx+fCAFQtOMQ358IAlCk9gofnwgA0KY2hx+IAAzABUgADEAF0IQhkKAgPwAg4R8IARCk9gofnwgBULn9id+fCIHQoCAQH0iCkIViHwiDEKAgEB9Ig1CFYd8Ig8gD0KAgEB9Ig9CgICAf4N9IAwgAULRqwh+fCANQoCAgH+DfSALIAhCgICAf4N9IAJC0asIfiAAKAAkIhZBGHatIAAxAChCCIaEIAAxAClCEIaEQgOIfCAGQoOhVn58IBZBBnZB////AHGtIAJC04xDfnwgBkLRqwh+fCAJQoOhVn58IgxCgIBAfSINQhWHfCIIQoCAQH0iDkIVh3wiC0KDoVZ+fCAHIApCgICA////A4N9IANCk9gofiAAKAAPIhZBGHatIAAxABNCCIaEIAAxABRCEIaEQgOIfCAFQpjaHH58IBZBBnZB////AHGtIAVCk9gofnwiCkKAgEB9IhJCFYh8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IAAoAgQiGq0hCSAaQQVsrSEQIBlBBWytIQ4gGEEFbK0hDCAXQQVsrSEKIAA1AgAhCANAIAEoAANBAnZB////H3EgFWqtIgMgDX4gASgAAEH///8fcSARaq0iBCAPfnwgASgABkEEdkH///8fcSAUaq0iBSALfnwgASgACUEGdiATaq0iBiAJfnwgEiAWaiABKAAMQQh2aq0iByAIfnwgAyALfiAEIA1+fCAFIAl+fCAGIAh+fCAHIAp+fCADIAl+IAQgC358IAUgCH58IAYgCn58IAcgDH58IAMgCH4gBCAJfnwgBSAKfnwgBiAMfnwgByAOfnwgAyAKfiAEIAh+fCAFIAx+fCAGIA5+fCAHIBB+fCIDQhqIQv////8Pg3wiBEIaiEL/////D4N8IgVCGohC/////w+DfCIGQhqIQv////8Pg3wiB0IaiKdBBWwgA6dB////H3FqIhFBGnYgBKdB////H3FqIRUgBadB////H3EhFCAGp0H///8fcSETIAenQf///x9xIRIgEUH///8fcSERIAFBEGohASACQhB9IgJCD1YNAAsgACASNgIkIAAgEzYCICAAIBQ2AhwgACAVNgIYIAAgETYCFAvvJgEnfyMAQdAEayIdJABBfyENIABBIGohCEEgIQpBASEFA0AgCkEBayIJQfAUai0AACIHIAggCWotAAAiCXNBAWtBCHUgBXEiBiAIIApBAmsiCmotAAAiDCAKQfAUai0AACIOa0EIdXEgCSAHa0EIdSAFcSALcnIhCyAMIA5zQQFrQQh1IAZxIQUgCg0ACwJAIAtFDQAgABBYDQAgAy0AH0F/c0H/AHEgAy0AASADLQACIAMtAAMgAy0ABCADLQAFIAMtAAYgAy0AByADLQAIIAMtAAkgAy0ACiADLQALIAMtAAwgAy0ADSADLQAOIAMtAA8gAy0AECADLQARIAMtABIgAy0AEyADLQAUIAMtABUgAy0AFiADLQAXIAMtABggAy0AGSADLQAaIAMtABsgAy0AHCADLQAeIAMtAB1xcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcUH/AXNyQQFrQewBIAMtAABrcUF/c0EIdkEBcUUNACADEFgNACAdQYABaiIKIAMQeQ0AIB1BgANqIgsQJSAEBEAgC0HguAJCIhAQGgsgCyAAQiAQEBogCyADQiAQEBogCyABIAIQEBogCyAdQcACaiIBEBwgARBXIB1BCGohDSABIQQgCCELQQAhA0EAIQEjAEHgEWsiBSQAA0AgBUHgD2oiCCADaiAEIANBA3ZqLQAAIgkgA0EGcXZBAXE6AAAgCCADQQFyIgdqIAkgB0EHcXZBAXE6AAAgA0ECaiIDQYACRw0AC0H+ASEEA0AgASIIQQFqIQECQCAIIAVB4A9qIgNqIgktAABFDQAgCEH+AUsNAAJAIAEgA2oiAywAACIHRQ0AIAdBAXQiByAJLAAAIgZqIgxBD0wEQCAJIAw6AAAgA0EAOgAADAELIAYgB2siA0FxSA0BIAkgAzoAACABIQMDQCAFQeAPaiADaiIHLQAARQRAIAdBAToAAAwCCyAHQQA6AAAgA0EBaiIDQYACRw0ACwsgBEUNAAJAIAhBAmoiAyAFQeAPamoiBywAACIGRQ0AIAZBAnQiBiAJLAAAIgxqIg5BEE4EQCAMIAZrIgdBcUgNAiAJIAc6AAADQCAFQeAPaiADaiIHLQAABEAgB0EAOgAAIANBAWoiA0GAAkcNAQwDCwsgB0EBOgAADAELIAkgDjoAACAHQQA6AAALQQUgBCAEQQVPG0EBaiIHQQJGDQACQCAIQQNqIgMgBUHgD2pqIgYsAAAiDEUNACAMQQN0IgwgCSwAACIOaiIPQRBOBEAgDiAMayIGQXFIDQIgCSAGOgAAA0AgBUHgD2ogA2oiBi0AAARAIAZBADoAACADQQFqIgNBgAJHDQEMAwsLIAZBAToAAAwBCyAJIA86AAAgBkEAOgAACyAHQQNGDQACQCAIQQRqIgMgBUHgD2pqIgYsAAAiDEUNACAMQQR0IgwgCSwAACIOaiIPQRBOBEAgDiAMayIGQXFIDQIgCSAGOgAAA0AgBUHgD2ogA2oiBi0AAARAIAZBADoAACADQQFqIgNBgAJHDQEMAwsLIAZBAToAAAwBCyAJIA86AAAgBkEAOgAACyAHQQRGDQACQCAIQQVqIgMgBUHgD2pqIgYsAAAiDEUNACAMQQV0IgwgCSwAACIOaiIPQRBOBEAgDiAMayIGQXFIDQIgCSAGOgAAA0AgBUHgD2ogA2oiBi0AAARAIAZBADoAACADQQFqIgNBgAJHDQEMAwsLIAZBAToAAAwBCyAJIA86AAAgBkEAOgAACyAHQQVGDQAgCEEGaiIDIAVB4A9qaiIILAAAIgdFDQAgB0EGdCIHIAksAAAiBmoiDEEQTgRAIAYgB2siCEFxSA0BIAkgCDoAAANAIAVB4A9qIANqIggtAAAEQCAIQQA6AAAgA0EBaiIDQYACRw0BDAMLCyAIQQE6AAAMAQsgCSAMOgAAIAhBADoAAAsgBEEBayEEIAFBgAJHDQALQQAhAwNAIAVB4A1qIgEgA2ogCyADQQN2ai0AACIEIANBBnF2QQFxOgAAIAEgA0EBciIIaiAEIAhBB3F2QQFxOgAAIANBAmoiA0GAAkcNAAtBACEBQf4BIQQDQCABIghBAWohAQJAIAggBUHgDWoiA2oiCy0AAEUNACAIQf4BSw0AAkAgASADaiIDLAAAIglFDQAgCUEBdCIJIAssAAAiB2oiBkEPTARAIAsgBjoAACADQQA6AAAMAQsgByAJayIDQXFIDQEgCyADOgAAIAEhAwNAIAVB4A1qIANqIgktAABFBEAgCUEBOgAADAILIAlBADoAACADQQFqIgNBgAJHDQALCyAERQ0AAkAgCEECaiIDIAVB4A1qaiIJLAAAIgdFDQAgB0ECdCIHIAssAAAiBmoiDEEQTgRAIAYgB2siCUFxSA0CIAsgCToAAANAIAVB4A1qIANqIgktAAAEQCAJQQA6AAAgA0EBaiIDQYACRw0BDAMLCyAJQQE6AAAMAQsgCyAMOgAAIAlBADoAAAtBBSAEIARBBU8bQQFqIglBAkYNAAJAIAhBA2oiAyAFQeANamoiBywAACIGRQ0AIAZBA3QiBiALLAAAIgxqIg5BEE4EQCAMIAZrIgdBcUgNAiALIAc6AAADQCAFQeANaiADaiIHLQAABEAgB0EAOgAAIANBAWoiA0GAAkcNAQwDCwsgB0EBOgAADAELIAsgDjoAACAHQQA6AAALIAlBA0YNAAJAIAhBBGoiAyAFQeANamoiBywAACIGRQ0AIAZBBHQiBiALLAAAIgxqIg5BEE4EQCAMIAZrIgdBcUgNAiALIAc6AAADQCAFQeANaiADaiIHLQAABEAgB0EAOgAAIANBAWoiA0GAAkcNAQwDCwsgB0EBOgAADAELIAsgDjoAACAHQQA6AAALIAlBBEYNAAJAIAhBBWoiAyAFQeANamoiBywAACIGRQ0AIAZBBXQiBiALLAAAIgxqIg5BEE4EQCAMIAZrIgdBcUgNAiALIAc6AAADQCAFQeANaiADaiIHLQAABEAgB0EAOgAAIANBAWoiA0GAAkcNAQwDCwsgB0EBOgAADAELIAsgDjoAACAHQQA6AAALIAlBBUYNACAIQQZqIgMgBUHgDWpqIggsAAAiCUUNACAJQQZ0IgkgCywAACIHaiIGQRBOBEAgByAJayIIQXFIDQEgCyAIOgAAA0AgBUHgDWogA2oiCC0AAARAIAhBADoAACADQQFqIgNBgAJHDQEMAwsLIAhBAToAAAwBCyALIAY6AAAgCEEAOgAACyAEQQFrIQQgAUGAAkcNAAsgBUHgA2oiCyAKEBIgBSAKKQIgNwPAASAFIAopAhg3A7gBIAUgCikCEDcDsAEgBSAKKQIINwOoASAFIAopAgA3A6ABIAUgCikCKDcDyAEgBSAKKQIwNwPQASAFIAopAjg3A9gBIAUgCkFAaykCADcD4AEgBSAKKQJINwPoASAFIAopAlA3A/ABIAUgCikCWDcD+AEgBSAKKQJgNwOAAiAFIAopAmg3A4gCIAUgCikCcDcDkAIgBUHAAmoiASAFQaABaiIEECIgBSABIAVBuANqIgMQBiAFQShqIAVB6AJqIgogBUGQA2oiCBAGIAVB0ABqIAggAxAGIAVB+ABqIAEgChAGIAEgBSALEBMgBCABIAMQBiAFQcgBaiIJIAogCBAGIAVB8AFqIgcgCCADEAYgBUGYAmoiCyABIAoQBiAFQYAFaiIGIAQQEiABIAUgBhATIAQgASADEAYgCSAKIAgQBiAHIAggAxAGIAsgASAKEAYgBUGgBmoiBiAEEBIgASAFIAYQEyAEIAEgAxAGIAkgCiAIEAYgByAIIAMQBiALIAEgChAGIAVBwAdqIgYgBBASIAEgBSAGEBMgBCABIAMQBiAJIAogCBAGIAcgCCADEAYgCyABIAoQBiAFQeAIaiIGIAQQEiABIAUgBhATIAQgASADEAYgCSAKIAgQBiAHIAggAxAGIAsgASAKEAYgBUGACmoiBiAEEBIgASAFIAYQEyAEIAEgAxAGIAkgCiAIEAYgByAIIAMQBiALIAEgChAGIAVBoAtqIgYgBBASIAEgBSAGEBMgBCABIAMQBiAJIAogCBAGIAcgCCADEAYgCyABIAoQBiAFQcAMaiAEEBIgDUIANwIgIA1CADcCGCANQgA3AhAgDUIANwIIIA1CADcCACANQgA3AiwgDUEoaiIiQQE2AgAgDUIANwI0IA1CADcCPCANQgA3AkQgDUIANwJUIA1CgICAgBA3AkwgDUIANwJcIA1CADcCZCANQgA3AmwgDUEANgJ0IA1B0ABqISNB/wEhBANAAkACQAJAIAVB4A9qIgYgBGotAAANACAFQeANaiIMIARqLQAADQAgBiAEQQFrIgFqLQAARQRAIAEgDGotAABFDQILIAEhBAsgBEEASA0BA0AgBUHAAmoiBiANECICQCAEIgEgBUHgD2pqLAAAIgRBAEoEQCAFQaABaiIMIAYgAxAGIAkgCiAIEAYgByAIIAMQBiALIAYgChAGIAYgDCAFQeADaiAEQf4BcUEBdkGgAWxqEBMMAQsgBEEATg0AIAVBoAFqIgwgBUHAAmoiBiADEAYgCSAKIAgQBiAHIAggAxAGIAsgBiAKEAYgBiAMIAVB4ANqQQAgBGtB/gFxQQF2QaABbGoQdwsCQCAFQeANaiABaiwAACIEQQBKBEAgBUGgAWoiDCAFQcACaiIGIAMQBiAJIAogCBAGIAcgCCADEAYgCyAGIAoQBiAGIAwgBEH+AXFBAXZB+ABsQdALahBZDAELIARBAE4NACAFQaABaiAFQcACaiIGIAMQBiAJIAogCBAGIAcgCCADEAYgCyAGIAoQBiAFKAKgASEMIAUoAsgBIQ4gBSgCpAEhDyAFKALMASEQIAUoAqgBIREgBSgC0AEhEiAFKAKsASETIAUoAtQBIRQgBSgCsAEhFSAFKALYASEWIAUoArQBIRcgBSgC3AEhGCAFKAK4ASEZIAUoAuABIRogBSgCvAEhGyAFKALkASEcIAUoAsABIR4gBSgC6AEhHyAFIAUoAuwBIiAgBSgCxAEiIWs2AowDIAUgHyAeazYCiAMgBSAcIBtrNgKEAyAFIBogGWs2AoADIAUgGCAXazYC/AIgBSAWIBVrNgL4AiAFIBQgE2s2AvQCIAUgEiARazYC8AIgBSAQIA9rNgLsAiAFIA4gDGs2AugCIAUgICAhajYC5AIgBSAeIB9qNgLgAiAFIBsgHGo2AtwCIAUgGSAaajYC2AIgBSAXIBhqNgLUAiAFIBUgFmo2AtACIAUgEyAUajYCzAIgBSARIBJqNgLIAiAFIA8gEGo2AsQCIAUgDCAOajYCwAIgCCAGQQAgBGtB/gFxQQF2QfgAbEHQC2oiBEEoahAGIAogCiAEEAYgAyAEQdAAaiALEAYgBSgClAIhHiAFKAKQAiEfIAUoAowCISAgBSgCiAIhISAFKAKEAiEkIAUoAoACISUgBSgC/AEhJiAFKAL4ASEnIAUoAvQBISggBSgC8AEhKSAFKALoAiEEIAUoApADIQYgBSgC7AIhDCAFKAKUAyEOIAUoAvACIQ8gBSgCmAMhECAFKAL0AiERIAUoApwDIRIgBSgC+AIhEyAFKAKgAyEUIAUoAvwCIRUgBSgCpAMhFiAFKAKAAyEXIAUoAqgDIRggBSgChAMhGSAFKAKsAyEaIAUoAogDIRsgBSgCsAMhHCAFIAUoAowDIiogBSgCtAMiK2o2AowDIAUgGyAcajYCiAMgBSAZIBpqNgKEAyAFIBcgGGo2AoADIAUgFSAWajYC/AIgBSATIBRqNgL4AiAFIBEgEmo2AvQCIAUgDyAQajYC8AIgBSAMIA5qNgLsAiAFIAQgBmo2AugCIAUgKyAqazYC5AIgBSAcIBtrNgLgAiAFIBogGWs2AtwCIAUgGCAXazYC2AIgBSAWIBVrNgLUAiAFIBQgE2s2AtACIAUgEiARazYCzAIgBSAQIA9rNgLIAiAFIA4gDGs2AsQCIAUgBiAEazYCwAIgBSApQQF0IgQgBSgCuAMiBms2ApADIAUgKEEBdCIMIAUoArwDIg5rNgKUAyAFICdBAXQiDyAFKALAAyIQazYCmAMgBSAmQQF0IhEgBSgCxAMiEms2ApwDIAUgJUEBdCITIAUoAsgDIhRrNgKgAyAFICRBAXQiFSAFKALMAyIWazYCpAMgBSAhQQF0IhcgBSgC0AMiGGs2AqgDIAUgIEEBdCIZIAUoAtQDIhprNgKsAyAFIB9BAXQiGyAFKALYAyIcazYCsAMgBSAeQQF0Ih4gBSgC3AMiH2s2ArQDIAUgBCAGajYCuAMgBSAMIA5qNgK8AyAFIA8gEGo2AsADIAUgESASajYCxAMgBSATIBRqNgLIAyAFIBUgFmo2AswDIAUgFyAYajYC0AMgBSAZIBpqNgLUAyAFIBsgHGo2AtgDIAUgHiAfajYC3AMLIA0gBUHAAmogAxAGICIgCiAIEAYgIyAIIAMQBiABQQFrIQQgAUEASg0ACwwBCyAEQQJrIQQgAQ0BCwsgBUHgEWokACAdQaACaiIBIA0QQ0F/IAEgABBMIAAgAUYbIAAgAUEgEEFyIQ0LIB1B0ARqJAAgDQurIgI4fgV/IwBBsARrIkAkACBAQeACaiI+ECUgBQRAID5B4LgCQiIQEBoLIEBBoAJqIARCIBAvGiBAQeACaiJBIEBBwAJqQiAQEBogQSACIAMQEBogQSBAQeABaiI+EBwgBCkAICEIIAQpACghByAEKQAwIQYgACAEKQA4NwA4IAAgBjcAMCAAIAc3ACggAEEgaiIEIAg3AAAgPhBXIEAgPhBCIAAgQBBDIEEQJSAFBEAgQUHguAJCIhAQGgsgQEHgAmoiBSAAQsAAEBAaIAUgAiADEBAaIAUgQEGgAWoiABAcIAAQVyBAIEAtAKACQfgBcToAoAIgQCBALQC/AkE/cUHAAHI6AL8CIAQgQEGgAmoiPzMAFSA/MQAXQhCGQoCA/ACDhCIPIAAoABxBB3atIhB+IAAoABciBUEYdq0gADEAG0IIhoQgADEAHEIQhoRCAohC////AIMiESA/KAAXIgJBBXZB////AHGtIhJ+fCAAMwAVIAAxABdCEIZCgID8AIOEIhMgPygAHEEHdq0iFH58IAJBGHatID8xABtCCIaEID8xABxCEIaEQgKIQv///wCDIhUgBUEFdkH///8Aca0iFn58IBIgFn4gPygADyIFQRh2rSA/MQATQgiGhCA/MQAUQhCGhEIDiCIXIBB+fCAPIBF+fCAAKAAPIgJBGHatIAAxABNCCIaEIAAxABRCEIaEQgOIIhggFH58IBMgFX58IglCgIBAfSIIQhWIfCIHQoCAQH0iBkIViCAUIBZ+IBAgEn58IBEgFX58IgMgA0KAgEB9IgNCgICA/////wCDfXwiLUKY2hx+IBAgFX4gESAUfnwgA0IViHwiAyADQoCAQH0iKUKAgID/////AIN9Ii5Ck9gofnwgByAGQoCAgH+DfSIvQuf2J358IAkgCEKAgIB/g30gESAXfiAFQQZ2Qf///wBxrSIZIBB+fCASIBN+fCAPIBZ+fCAUIAJBBnZB////AHGtIhp+fCAVIBh+fCA/KAAKIkJBGHatID8xAA5CCIaEID8xAA9CEIaEQgGIQv///wCDIhsgEH4gESAZfnwgFiAXfnwgEiAYfnwgDyATfnwgACgACiJBQRh2rSAAMQAOQgiGhCAAMQAPQhCGhEIBiEL///8AgyIcIBR+fCAVIBp+fCIKQoCAQH0iC0IViHwiCUKAgEB9IghCFYh8IjBC04xDfnwgQEHgAWoiPigAFyIFQQV2Qf///wBxrSA/MwAAID8xAAJCEIZCgID8AIOEIh0gFn4gEyA/KAACIgJBBXZB////AHGtIh5+fCA/NQAHQgeIQv///wCDIh8gGn58IBwgQkEEdkH///8Aca0iIH58IAJBGHatID8xAAZCCIaEID8xAAdCEIaEQgKIQv///wCDIiEgGH58IBkgADUAB0IHiEL///8AgyIifnwgGyBBQQR2Qf///wBxrSIjfnwgFyAAKAACIgJBGHatIAAxAAZCCIaEIAAxAAdCEIaEQgKIQv///wCDIiR+fCAAMwAAIAAxAAJCEIZCgID8AIOEIiUgEn58IA8gAkEFdkH///8Aca0iJn58fCA+MwAVIBMgHX4gGCAefnwgHCAffnwgICAjfnwgGiAhfnwgGSAkfnwgGyAifnwgFyAmfnwgDyAlfnx8ID4xABdCEIZCgID8AIN8IgdCgIBAfSIGQhWIfCIDfCADQoCAQH0iDEKAgIB/g30gByAvQpjaHH4gLUKT2Ch+fCAwQuf2J358IBggHX4gGiAefnwgHyAjfnwgICAifnwgHCAhfnwgGSAmfnwgGyAkfnwgFyAlfnwgPigADyIAQRh2rSA+MQATQgiGhCA+MQAUQhCGhEIDiHwgAEEGdkH///8Aca0gGiAdfiAcIB5+fCAfICJ+fCAgICR+fCAhICN+fCAZICV+fCAbICZ+fHwiNkKAgEB9IjdCFYh8IidCgIBAfSI4QhWIfHwgBkKAgIB/g30iOUKAgEB9IjpCFYd8IipCgIBAfSIOQhWHIAkgCEKAgIB/g30gCiAQIBR+IihCgIBAfSINQhWIIjFCg6FWfnwgC0KAgIB/g30gFiAZfiAQICB+fCARIBt+fCATIBd+fCASIBp+fCAPIBh+fCAUICN+fCAVIBx+fCARICB+IBAgH358IBMgGX58IBYgG358IBcgGH58IBIgHH58IA8gGn58IBQgIn58IBUgI358IgpCgIBAfSILQhWIfCIJQoCAQH0iCEIViHwiB0KAgEB9IgZCFYd8IjJCg6FWfnwgESAdfiAWIB5+fCAYIB9+fCAaICB+fCATICF+fCAZICN+fCAbIBx+fCAXICJ+fCASICZ+fCAPICR+fCAVICV+fCAFQRh2rSA+MQAbQgiGhCA+MQAcQhCGhEICiEL///8Ag3wiAyAuQpjaHH4gKCANQoCAgP////8Dg30gKUIViHwiM0KT2Ch+fCAtQuf2J358IC9C04xDfnwgMELRqwh+fCAMQhWIfHwgA0KAgEB9IjtCgICAf4N9IgN8IANCgIBAfSI8QoCAgH+DfSIMICogByAGQoCAgH+DfSAzQoOhVn4gMULRqwh+fCAJfCAIQoCAgH+DfSAKIDFC04xDfnwgM0LRqwh+fCAuQoOhVn58IAtCgICAf4N9IBYgIH4gESAffnwgECAhfnwgGCAZfnwgEyAbfnwgFyAafnwgEiAjfnwgDyAcfnwgFCAkfnwgFSAifnwgFiAffiAQIB5+fCATICB+fCARICF+fCAZIBp+fCAYIBt+fCAXIBx+fCASICJ+fCAPICN+fCAUICZ+fCAVICR+fCI9QoCAQH0iK0IViHwiLEKAgEB9IilCFYh8Ig1CgIBAfSIKQhWHfCIGQoCAQH0iA0IVh3wiNEKDoVZ+IDJC0asIfnx8IA5CgICAf4N9IDkgNELRqwh+IDJC04xDfnwgBiADQoCAgH+DfSI1QoOhVn58IDBCmNocfiAvQpPYKH58ICd8IDYgMEKT2Ch+fCA3QoCAgH+DfSAcIB1+IB4gI358IB8gJH58ICAgJn58ICEgIn58IBsgJX58ID4oAAoiAEEYdq0gPjEADkIIhoQgPjEAD0IQhoRCAYhC////AIN8IABBBHZB////AHGtIB0gI34gHiAifnwgHyAmfnwgICAlfnwgISAkfnx8IjZCgIBAfSI3QhWIfCInQoCAQH0iKkIViHwiDkKAgEB9IihCFYd8IDhCgICAf4N9IgtCgIBAfSIJQhWHfHwgOkKAgIB/g30iCEKAgEB9IgdCFYd8IgZCgIBAfSIDQhWHfCAMQoCAQH0iDEKAgIB/g30gBiADQoCAgH+DfSAIIAdCgICAf4N9IDRC04xDfiAyQuf2J358IDVC0asIfnwgC3wgCUKAgIB/g30gDSAKQoCAgH+DfSAzQtOMQ34gMULn9id+fCAuQtGrCH58IC1Cg6FWfnwgLHwgKUKAgIB/g30gM0Ln9id+IDFCmNocfnwgLkLTjEN+fCA9fCAtQtGrCH58IC9Cg6FWfnwgK0KAgIB/g30gPigAHEEHdq0gECAdfiARIB5+fCATIB9+fCAYICB+fCAWICF+fCAZIBx+fCAaIBt+fCAXICN+fCASICR+fCAPICJ+fCAUICV+fCAVICZ+fHwgO0IViHwiDUKAgEB9IgpCFYh8IgtCgIBAfSIJQhWHfCIGQoCAQH0iA0IVh3wiK0KDoVZ+fCAOIDJCmNocfnwgKEKAgIB/g30gNELn9id+fCA1QtOMQ358ICtC0asIfnwgBiADQoCAgH+DfSIsQoOhVn58IghCgIBAfSIHQhWHfCIGQoCAQH0iA0IVh3wgBiADQoCAgH+DfSAIIAdCgICAf4N9IDJCk9gofiAnfCAqQoCAgH+DfSA0QpjaHH58IDVC5/YnfnwgCyAJQoCAgH+DfSAzQpjaHH4gMUKT2Ch+fCAuQuf2J358IC1C04xDfnwgL0LRqwh+fCAwQoOhVn58IA18IApCgICAf4N9IDxCFYd8Ig1CgIBAfSIKQhWHfCIpQoOhVn58ICtC04xDfnwgLELRqwh+fCA2IDdCgICAf4N9IB0gIn4gHiAkfnwgHyAlfnwgISAmfnwgPjUAB0IHiEL///8Ag3wgHSAkfiAeICZ+fCAhICV+fCA+KAACIgBBGHatID4xAAZCCIaEID4xAAdCEIaEQgKIQv///wCDfCIOQoCAQH0iKEIViHwiC0KAgEB9IglCFYh8IDRCk9gofnwgNUKY2hx+fCApQtGrCH58ICtC5/YnfnwgLELTjEN+fCIIQoCAQH0iB0IVh3wiBkKAgEB9IgNCFYd8IAYgDSAKQoCAgH+DfSAMQhWHfCInQoCAQH0iKkIVhyIMQoOhVn58IANCgICAf4N9IAggDELRqwh+fCAHQoCAgH+DfSALIAlCgICAf4N9IDVCk9gofnwgKULTjEN+fCArQpjaHH58ICxC5/YnfnwgDiAAQQV2Qf///wBxrSAdICZ+IB4gJX58fCAdICV+ID4zAAAgPjEAAkIQhkKAgPwAg4R8Ig1CgIBAfSIKQhWIfCILQoCAQH0iCUIViHwgKEKAgIB/g30gKULn9id+fCArQpPYKH58ICxCmNocfnwiCEKAgEB9IgdCFYd8IgZCgIBAfSIDQhWHfCAGIAxC04xDfnwgA0KAgIB/g30gCCAMQuf2J358IAdCgICAf4N9IAsgCUKAgIB/g30gKUKY2hx+fCAsQpPYKH58IA0gCkKAgID///8Dg30gKUKT2Ch+fCIIQoCAQH0iB0IVh3wiBkKAgEB9IgNCFYd8IAYgDEKY2hx+fCADQoCAgH+DfSAIIAdCgICAf4N9IAxCk9gofnwiDEIVh3wiDkIVh3wiKEIVh3wiDUIVh3wiCkIVh3wiC0IVh3wiCUIVh3wiCEIVh3wiB0IVh3wiBkIVh3wiA0IVhyAnICpCgICAf4N9fCIqQhWHIidCk9gofiAMQv///wCDfCIMPAAAIAQgDEIIiDwAASAEICdCmNocfiAOQv///wCDfCAMQhWHfCIOQguIPAAEIAQgDkIDiDwAAyAEIAxCEIhCH4MgDkIFhoQ8AAIgBCAnQuf2J34gKEL///8Ag3wgDkIVh3wiKEIGiDwABiAEIChCAoYgDkKAgOAAg0ITiIQ8AAUgBCAnQtOMQ34gDUL///8Ag3wgKEIVh3wiDUIJiDwACSAEIA1CAYg8AAggBCANQgeGIChCgID/AINCDoiEPAAHIAQgJ0LRqwh+IApC////AIN8IA1CFYd8IgpCDIg8AAwgBCAKQgSIPAALIAQgCkIEhiANQoCA+ACDQhGIhDwACiAEICdCg6FWfiALQv///wCDfCAKQhWHfCILQgeIPAAOIAQgC0IBhiAKQoCAwACDQhSIhDwADSAEIAlC////AIMgC0IVh3wiCUIKiDwAESAEIAlCAog8ABAgBCAJQgaGIAtCgID+AINCD4iEPAAPIAQgCEL///8AgyAJQhWHfCIIQg2IPAAUIAQgCEIFiDwAEyAEIAdC////AIMgCEIVh3wiBzwAFSAEIAhCA4YgCUKAgPAAg0ISiIQ8ABIgBCAHQgiIPAAWIAQgBkL///8AgyAHQhWHfCIGQguIPAAZIAQgBkIDiDwAGCAEIAdCEIhCH4MgBkIFhoQ8ABcgBCADQv///wCDIAZCFYd8IgdCBog8ABsgBCAHQgKGIAZCgIDgAINCE4iEPAAaIAQgB0IVhyIDICpC////AIN8IgZCEYg8AB8gBCAGQgmIPAAeIAQgBkIHhiAHQoCA/wCDQg6IhDwAHCAEIAOnICqnakEBdq08AB0gP0HAABAHID5BwAAQByABBEAgAULAADcDAAsgQEGwBGokAEEAC60EARR/QfTKgdkGIQNBstqIywchDEHuyIGZAyENQeXwwYsGIQQgASgADCEPIAEoAAghBSABKAAEIQYgAigAHCESIAIoABghEEEUIREgAigAFCEOIAIoABAhCCACKAAMIQkgAigACCEKIAIoAAQhCyABKAAAIQEgAigAACECA0AgECAPIAIgDWpBB3dzIgcgDWpBCXdzIhMgBCAOakEHdyAJcyIJIARqQQl3IAVzIhQgCWpBDXcgDnMiFSADIAhqQQd3IApzIgogA2pBCXcgBnMiBiAKakENdyAIcyIIIAZqQRJ3IANzIgMgEiABIAxqQQd3cyIFakEHd3MiDiADakEJd3MiECAOakENdyAFcyISIBBqQRJ3IANzIQMgBSAFIAxqQQl3IAtzIgtqQQ13IAFzIhYgC2pBEncgDHMiASAHakEHdyAIcyIIIAFqQQl3IBRzIgUgCGpBDXcgB3MiDyAFakESdyABcyEMIBMgByATakENdyACcyIHakESdyANcyICIAlqQQd3IBZzIgEgAmpBCXcgBnMiBiABakENdyAJcyIJIAZqQRJ3IAJzIQ0gFCAVakESdyAEcyIEIApqQQd3IAdzIgIgBGpBCXcgC3MiCyACakENdyAKcyIKIAtqQRJ3IARzIQQgEUECSyARQQJrIRENAAsgACAENgAAIAAgDzYAHCAAIAU2ABggACAGNgAUIAAgATYAECAAIAM2AAwgACAMNgAIIAAgDTYABAu2AwIMfwN+IAApAzgiDkIAUgRAIABBQGsiAiAOpyIDakEBOgAAAkAgDkIBfEIPVg0AQQ8gA2siBkUNACAAIANqQcEAakEAIAb8CwALIABBAToAUCAAIAJCEBBcCyAANQI0IQ4gADUCMCEPIAA1AiwhECABIAAoAhQgACgCJCAAKAIgIAAoAhwgACgCGCIDQRp2aiICQRp2aiIHQRp2aiIGQRp2QQVsaiIEQf///x9xIgVBBWoiCEEadiADQf///x9xIARBGnZqIgRqIglBGnYgAkH///8fcSIKaiILQRp2IAdB////H3EiB2oiDEEadiAGQf///x9xaiINQYCAgCBrIgJBH3UiAyAEcSACQR92QQFrIgRB////H3EiAiAJcXIiCUEadCACIAhxIAMgBXFyciIFIAAoAihqIgg2AAAgASAFIAhLrSAQIAMgCnEgAiALcXIiBUEUdCAJQQZ2cq18fCIQPgAEIAEgDyADIAdxIAIgDHFyIgJBDnQgBUEMdnKtfCAQQiCIfCIPPgAIIAEgDiAEIA1xIAMgBnFyQQh0IAJBEnZyrXwgD0IgiHw+AAwgAEHYABAHC5wCAQV/A0AgACACQQJ0aiIEIAEgAkEDbGoiA0EBai0AAEEIdEGAHnEgAy0AAHI7AQAgBCADLQACQQR0IAMtAAFBBHZyOwECIAJBAWoiAkGAAUcNAAsgAUGAA2ohBCAAQYAEaiEFQQAhAgNAIAUgAkECdGoiBiAEIAJBA2xqIgNBAWotAABBCHRBgB5xIAMtAAByOwEAIAYgAy0AAkEEdCADLQABQQR2cjsBAiACQQFqIgJBgAFHDQALIAFBgAZqIQEgAEGACGohA0EAIQIDQCADIAJBAnRqIgQgASACQQNsaiIAQQFqLQAAQQh0QYAecSAALQAAcjsBACAEIAAtAAJBBHQgAC0AAUEEdnI7AQIgAkEBaiICQYABRw0ACwvdBAIHfgF/AkAgACkDOCIDQgBSBEAgAEIQIAN9IgQgAiACIARWGyIEQgBSBH4gBEIDgyEJIABBQGshCkIAIQMCQCAEQgRaBEAgBEJ8gyEFA0AgCiAAKQM4IAN8p2ogASADp2otAAA6AAAgCiADQgGEIgggACkDOHynaiABIAinai0AADoAACAKIANCAoQiCCAAKQM4fKdqIAEgCKdqLQAAOgAAIAogA0IDhCIIIAApAzh8p2ogASAIp2otAAA6AAAgA0IEfCEDIAdCBHwiByAFUg0ACyAJUA0BCwNAIAogACkDOCADfKdqIAEgA6dqLQAAOgAAIANCAXwhAyAGQgF8IgYgCVINAAsLIAApAzgFIAMLIAR8IgM3AzggA0IQVA0BIAAgAEFAa0IQEFwgAEIANwM4IAIgBH0hAiABIASnaiEBCyACQhBaBEAgACABIAJCcIMiAxBcIAJCD4MhAiABIAOnaiEBCyACUA0AIAJCA4MhBCAAQUBrIQpCACEGQgAhAwJAIAJCBFoEQCACQgyDIQlCACEHA0AgCiAAKQM4IAN8p2ogASADp2otAAA6AAAgCiADQgGEIgUgACkDOHynaiABIAWnai0AADoAACAKIANCAoQiBSAAKQM4fKdqIAEgBadqLQAAOgAAIAogA0IDhCIFIAApAzh8p2ogASAFp2otAAA6AAAgA0IEfCEDIAdCBHwiByAJUg0ACyAEUA0BCwNAIAogACkDOCADfKdqIAEgA6dqLQAAOgAAIANCAXwhAyAGQgF8IgYgBFINAAsLIAAgACkDOCACfDcDOAsLngMBBX8jAEGADWsiBCQAIARBgAFqIAIQYQJAA0BBfyEIIARBgAFqIAZBAXRqIgUvAQBBgBpLDQEgBS8BAkGAGksNASAFLwEEQYAaSw0BIAUvAQZBgBpLDQEgBkEEaiIGQYACRw0ACyAEQYAFaiEHQQAhBgNAIAcgBkEBdGoiBS8BAEGAGksNASAFLwECQYAaSw0BIAUvAQRBgBpLDQEgBS8BBkGAGksNASAGQQRqIgZBgAJHDQALIARBgAlqIQdBACEGA0AgByAGQQF0aiIFLwEAQYAaSw0BIAUvAQJBgBpLDQEgBS8BBEGAGksNASAFLwEGQYAaSw0BIAZBBGoiBkGAAkcNAAsgBCADKQAYNwNYIAQgAykAEDcDUCAEIAMpAAg3A0ggBCADKQAANwNAIARB4ABqIAJCoAkQZBogBCAEQUBrIgNCwAAQSxogACADIAIgBEEgahCSASABIAQpAxg3ABggASAEKQMQNwAQIAEgBCkDCDcACCABIAQpAwA3AAAgA0HAABAHIARBwAAQB0EAIQgLIARBgA1qJAAgCAu8AQEFfyMAQYACayIDJAAgA0EAQcgB/AsAIANBADoA7AEgA0EgNgLoASADQoCAgICAETcD4AEgAqciBwRAA0AgAygC5AEiBCAFRgRAIAMQDiADQQA2AuABIAMoAuQBIQRBACEFCyADIAEgBmogBSAEIAVrIgUgByAGayIEIAQgBUsbIgQQDSADIAMoAuABIARqIgU2AuABIAQgBmoiBiAHSQ0ACwsgAyAAEDYaIANBgAIQByADQYACaiQAQQALqQQCBH8BfiMAQaACayIEJAAgAEEoaiICIAAoAiBBA3ZBP3EiA2ohBQJAIANBOE8EQEHAACADayIDBEAgBUGAtgIgA/wKAAALIAAgAiAEIARBgAJqEE8gAkIANwMwIAJCADcDKCACQgA3AyAgAkIANwMYIAJCADcDECACQgA3AwggAkIANwMADAELQTggA2siA0UNACAFQYC2AiAD/AoAAAsgACAAKQMgIgZCOIYgBkKA/gODQiiGhCAGQoCA/AeDQhiGIAZCgICA+A+DQgiGhIQgBkIIiEKAgID4D4MgBkIYiEKAgPwHg4QgBkIoiEKA/gODIAZCOIiEhIQ3A2AgACACIAQgBEGAAmoQTyABIAAoAgAiAkH/gfwHcUEIeCACQRh4Qf+B/AdxcjYAACABIAAoAgQiAkH/gfwHcUEIeCACQRh4Qf+B/AdxcjYABCABIAAoAggiAkH/gfwHcUEIeCACQRh4Qf+B/AdxcjYACCABIAAoAgwiAkH/gfwHcUEIeCACQRh4Qf+B/AdxcjYADCABIAAoAhAiAkH/gfwHcUEIeCACQRh4Qf+B/AdxcjYAECABIAAoAhQiAkH/gfwHcUEIeCACQRh4Qf+B/AdxcjYAFCABIAAoAhgiAkH/gfwHcUEIeCACQRh4Qf+B/AdxcjYAGCABIAAoAhwiAUH/gfwHcUEIeCABQRh4Qf+B/AdxcjYAHCAEQaACEAcgAEHoABAHIARBoAJqJAALmAMCBX8CfiMAQUBqIgQkAAJAIAJBwQBrQf8BcUG/AUsEQEF/IQYgACkAUFAEQCAAKADgAiIDQYEBTwRAIABBQGsiAyADKQAAIghCgAF8NwAAIAAgACkASCAIQv9+Vq18NwBIIAAgAEHgAGoiBRA8IAAgACgA4AJBgAFrIgM2AOACIANBgQFPDQMgAwRAIAUgAEHgAWogA/wKAAALIAAoAOACIQMLIABBQGsiBSAFKQAAIgggA618Igk3AAAgACAAKQBIIAggCVatfDcASCAALQDkAgRAIABCfzcAWAsgAEJ/NwBQIABB4ABqIQVBACEGQYACIANrIgcEQCADIAVqQQAgB/wLAAsgACAFEDwgBCAAKQAANwMAIAQgACkACDcDCCAEIAApABA3AxAgBCAAKQAYNwMYIAQgACkAIDcDICAEIAApACg3AyggBCAAKQAwNwMwIAQgACkAODcDOCACBEAgASAEIAL8CgAACyAAQcAAEAcgBUGAAhAHCyAEQUBrJAAgBg8LEAoAC0H9CUHzCEGyAkG1CBAAAAsaAQF/ECBB7MQCKAIAKAIIIgAEQCAAEQ0ACwsoACACQoCAgIAQWgRAEAoACyAAIAEgAiADQQEgBEH0uQIoAgARDgAaCygAIAJCgICAgBBaBEAQCgALIAAgASACIANCASAEQfC5AigCABEPABoLqwYBFH8jAEHgAWsiAyQAIAIoAhAhBCACQUBrIgUoAgAhBiACKAJQIQkgAigCICEKIAIoAjAhCyACKAIUIQcgAigCRCEMIAIoAlQhDSABKAAEIQ4gAigCJCEPIAIoAjQhECACKAIYIQggAigCSCERIAIoAlghEiABKAAIIRMgAigCKCEUIAIoAjghFSABKAAAIRYgACACKAIsIAIoAjxxIAIoAhwgAigCTCACKAJcIAEoAAxzc3NzIgE2AAwgACAUIBVxIAggESASIBNzc3NzIgg2AAggACAPIBBxIAcgDCANIA5zc3NzIgc2AAQgACAKIAtxIAQgBiAJIBZzc3NzIgA2AAAgAyACKQJYNwPYASADIAIpAlA3A9ABIAMgBSkCADcDsAEgAyACKQJINwO4ASADIAIpAlA3A6ABIAMgAikCWDcDqAEgA0HAAWoiBCADQbABaiADQaABahAFIAIgAykCyAE3AlggAiADKQLAATcCUCADIAIpAjA3A5ABIAMgAikCODcDmAEgAyAFKQIANwOAASADIAIpAkg3A4gBIAQgA0GQAWogA0GAAWoQBSACIAMpAsgBNwJIIAUgAykCwAE3AgAgAyACKQIgNwNwIAMgAikCKDcDeCADIAIpAjA3A2AgAyACKQI4NwNoIAQgA0HwAGogA0HgAGoQBSACIAMpAsgBNwI4IAIgAykCwAE3AjAgAyACKQIQNwNQIAMgAikCGDcDWCADIAIpAiA3A0AgAyACKQIoNwNIIAQgA0HQAGogA0FAaxAFIAIgAykCyAE3AiggAiADKQLAATcCICADIAIpAgA3AzAgAyACKQIINwM4IAMgAikCEDcDICADIAIpAhg3AyggBCADQTBqIANBIGoQBSACIAMpAsgBNwIYIAIgAykCwAE3AhAgAyADKQPQATcDECADIAMpA9gBNwMYIAMgAikCADcDACADIAIpAgg3AwggBCADQRBqIAMQBSADKALAASEFIAMoAsQBIQQgAygCyAEhBiACIAMoAswBIAFzNgIMIAIgBiAIczYCCCACIAQgB3M2AgQgAiAAIAVzNgIAIANB4AFqJAAL+QgBE38jAEHgAWsiBSQAIAQoAjwgA0IdiKdzIQkgBCgCOCADp0EDdHMhCiAEKAI0IAJCHYincyENIAQoAjAgAqdBA3RzIQ8gBEFAayEGA0AgBSAEKQJYNwPYASAFIAQpAlA3A9ABIAUgBikCADcDsAEgBSAGKQIINwO4ASAFIAQpAlA3A6ABIAUgBCkCWDcDqAEgBUHAAWoiByAFQbABaiAFQaABahAFIAQgBSkCyAE3AlggBCAFKQLAATcCUCAFIAQpAjA3A5ABIAUgBCkCODcDmAEgBSAGKQIANwOAASAFIAYpAgg3A4gBIAcgBUGQAWogBUGAAWoQBSAGIAUpAsgBNwIIIAYgBSkCwAE3AgAgBSAEKQIgNwNwIAUgBCkCKDcDeCAFIAQpAjA3A2AgBSAEKQI4NwNoIAcgBUHwAGogBUHgAGoQBSAEIAUpAsgBNwI4IAQgBSkCwAE3AjAgBSAEKQIQNwNQIAUgBCkCGDcDWCAFIAQpAiA3A0AgBSAEKQIoNwNIIAcgBUHQAGogBUFAaxAFIAQgBSkCyAE3AiggBCAFKQLAATcCICAFIAQpAgA3AzAgBSAEKQIINwM4IAUgBCkCEDcDICAFIAQpAhg3AyggByAFQTBqIAVBIGoQBSAEIAUpAsgBNwIYIAQgBSkCwAE3AhAgBSAFKQPQATcDECAFIAUpA9gBNwMYIAUgBCkCADcDACAFIAQpAgg3AwggByAFQRBqIAUQBSAFKALAASEHIAUoAsQBIQsgBSgCyAEhDCAEIAkgBSgCzAFzIg42AgwgBCAKIAxzIgw2AgggBCALIA1zIgs2AgQgBCAHIA9zIgc2AgAgCEEBaiIIQQdHDQALAkACQAJAAkAgAUEQaw4RAAICAgICAgICAgICAgICAgECCyAEKAIQIQEgBCgCMCEGIAQoAiAhCCAEKAJQIQkgBEFAaygCACEKIAQoAhQhDSAEKAI0IQ8gBCgCJCEQIAQoAlQhESAEKAJEIRIgBCgCGCETIAQoAjghFCAEKAIoIRUgBCgCWCEWIAQoAkghFyAAIAQoAhwgBCgCPCAEKAIsIAQoAlwgBCgCTHNzc3MgDnM2AAwgACATIBQgFSAWIBdzc3NzIAxzNgAIIAAgDSAPIBAgESASc3NzcyALczYABCAAIAEgBiAIIAkgCnNzc3MgB3M2AAAMAgsgBCgCICEBIAQoAhAhBiAEKAIkIQggBCgCFCEJIAQoAighCiAEKAIYIQ0gACAEKAIsIAQoAhxzIA5zNgAMIAAgCiANcyAMczYACCAAIAggCXMgC3M2AAQgACABIAZzIAdzNgAAIAQoAjAhASAEKAJQIQYgBEFAaygCACEIIAQoAjQhDiAEKAJUIQwgBCgCRCELIAQoAjghByAEKAJYIQkgBCgCSCEKIAAgBCgCPCAEKAJcIAQoAkxzczYAHCAAIAcgCSAKc3M2ABggACAOIAsgDHNzNgAUIAAgASAGIAhzczYAEAwBCyABRQ0AIABBACAB/AsACyAFQeABaiQAC6UGARR/IwBB4AFrIgMkACACKAIQIQUgAkFAayIEKAIAIQkgAigCUCEKIAIoAiAhCyACKAIwIQwgASgABCEGIAIoAhQhDSACKAJEIQ4gAigCVCEPIAIoAiQhECACKAI0IREgASgACCEHIAIoAhghEiACKAJIIRMgAigCWCEUIAIoAighFSACKAI4IRYgASgAACEIIAAgASgADCIBIAIoAiwgAigCPHEgAigCHCACKAJcIAIoAkxzc3NzNgAMIAAgByAVIBZxIBIgEyAUc3NzczYACCAAIAYgECARcSANIA4gD3Nzc3M2AAQgACAIIAsgDHEgBSAJIApzc3NzNgAAIAMgAikCWDcD2AEgAyACKQJQNwPQASADIAQpAgA3A7ABIAMgAikCSDcDuAEgAyACKQJQNwOgASADIAIpAlg3A6gBIANBwAFqIgAgA0GwAWogA0GgAWoQBSACIAMpAsgBNwJYIAIgAykCwAE3AlAgAyACKQIwNwOQASADIAIpAjg3A5gBIAMgBCkCADcDgAEgAyACKQJINwOIASAAIANBkAFqIANBgAFqEAUgAiADKQLIATcCSCAEIAMpAsABNwIAIAMgAikCIDcDcCADIAIpAig3A3ggAyACKQIwNwNgIAMgAikCODcDaCAAIANB8ABqIANB4ABqEAUgAiADKQLIATcCOCACIAMpAsABNwIwIAMgAikCEDcDUCADIAIpAhg3A1ggAyACKQIgNwNAIAMgAikCKDcDSCAAIANB0ABqIANBQGsQBSACIAMpAsgBNwIoIAIgAykCwAE3AiAgAyACKQIANwMwIAMgAikCCDcDOCADIAIpAhA3AyAgAyACKQIYNwMoIAAgA0EwaiADQSBqEAUgAiADKQLIATcCGCACIAMpAsABNwIQIAMgAykD0AE3AxAgAyADKQPYATcDGCADIAIpAgA3AwAgAyACKQIINwMIIAAgA0EQaiADEAUgAygCwAEhACADKALEASEEIAMoAsgBIQUgAiABIAMoAswBczYCDCACIAUgB3M2AgggAiAEIAZzNgIEIAIgACAIczYCACADQeABaiQAC6UJAQ1/IwBBoANrIgIkACAAKAAQIQYgACgAFCEHIAAoABghCCAAKAAcIQkgACgABCEEIAAoAAghBSAAKAAMIQogACgAACELIAIgASkCWDcDmAMgAiABKQJQNwOQAyACIAFBQGsiACkCADcD8AIgAiABKQJINwP4AiACIAEpAlA3A+ACIAIgASkCWDcD6AIgAkGAA2oiAyACQfACaiACQeACahAFIAEgAikCiAM3AlggASACKQKAAzcCUCACIAEpAjA3A9ACIAIgASkCODcD2AIgAiAAKQIANwPAAiACIAEpAkg3A8gCIAMgAkHQAmogAkHAAmoQBSABIAIpAogDNwJIIAAgAikCgAM3AgAgAiABKQIgNwOwAiACIAEpAig3A7gCIAIgASkCMDcDoAIgAiABKQI4NwOoAiADIAJBsAJqIAJBoAJqEAUgASACKQKIAzcCOCABIAIpAoADNwIwIAIgASkCEDcDkAIgAiABKQIYNwOYAiACIAEpAiA3A4ACIAIgASkCKDcDiAIgAyACQZACaiACQYACahAFIAEgAikCiAM3AiggASACKQKAAzcCICACIAEpAgA3A/ABIAIgASkCCDcD+AEgAiABKQIQNwPgASACIAEpAhg3A+gBIAMgAkHwAWogAkHgAWoQBSABIAIpAogDNwIYIAEgAikCgAM3AhAgAiACKQOQAzcD0AEgAiACKQOYAzcD2AEgAiABKQIANwPAASACIAEpAgg3A8gBIAMgAkHQAWogAkHAAWoQBSACKAKAAyEMIAIoAoQDIQ0gAigCiAMhDiABIAogAigCjANzNgIMIAEgBSAOczYCCCABIAQgDXM2AgQgASALIAxzNgIAIAIgASkCWDcDmAMgAiABKQJQNwOQAyACIAApAgA3A7ABIAIgASkCSDcDuAEgAiABKQJQNwOgASACIAEpAlg3A6gBIAMgAkGwAWogAkGgAWoQBSABIAIpAogDNwJYIAEgAikCgAM3AlAgAiABKQIwNwOQASACIAEpAjg3A5gBIAIgACkCADcDgAEgAiABKQJINwOIASADIAJBkAFqIAJBgAFqEAUgASACKQKIAzcCSCAAIAIpAoADNwIAIAIgASkCIDcDcCACIAEpAig3A3ggAiABKQIwNwNgIAIgASkCODcDaCADIAJB8ABqIAJB4ABqEAUgASACKQKIAzcCOCABIAIpAoADNwIwIAIgASkCEDcDUCACIAEpAhg3A1ggAiABKQIgNwNAIAIgASkCKDcDSCADIAJB0ABqIAJBQGsQBSABIAIpAogDNwIoIAEgAikCgAM3AiAgAiABKQIANwMwIAIgASkCCDcDOCACIAEpAhA3AyAgAiABKQIYNwMoIAMgAkEwaiACQSBqEAUgASACKQKIAzcCGCABIAIpAoADNwIQIAIgAikDkAM3AxAgAiACKQOYAzcDGCACIAEpAgA3AwAgAiABKQIINwMIIAMgAkEQaiACEAUgAigCgAMhACACKAKEAyEEIAIoAogDIQUgASAJIAIoAowDczYCDCABIAUgCHM2AgggASAEIAdzNgIEIAEgACAGczYCACACQaADaiQAC94UARV/IwBBoAZrIgMkACABKAAEIQggASgACCEJIAEoAAwhCiABKAAQIQsgASgAFCEMIAEoABghDSABKAAcIQ4gACgABCEPIAAoAAghECAAKAAMIREgACgAECESIAAoABQhEyAAKAAYIRQgACgAHCEVIAEoAAAhFiACQUBrIgEgACgAACIAQYCChBBzNgIAIAJClcTcyYWy+rziADcCOCACQoCChJCwoIGEDTcCMCACQqCixJG0rq2UXTcCKCACQtv74KjVzfCXcTcCICACIAAgFnMiFjYCACACIBVB8+qi6X1zNgJcIAIgFEGgosSRBHM2AlggAiATQe2Ev4l/czYCVCACIBJB2/vgqAVzNgJQIAIgEUGQ0+eTBnM2AkwgAiAQQZXE3MkFczYCSCACIA9Bg4qg6ABzNgJEIAIgDiAVcyIONgIcIAIgDSAUcyINNgIYIAIgDCATcyIMNgIUIAIgCyAScyILNgIQIAIgCiARcyIKNgIMIAIgCSAQcyIJNgIIIAIgCCAPcyIXNgIEQQAhCANAIAMgAikCWDcDmAYgAyACKQJQNwOQBiADIAEpAgA3A/AFIAMgASkCCDcD+AUgAyACKQJQNwPgBSADIAIpAlg3A+gFIANBgAZqIgQgA0HwBWogA0HgBWoQBSACIAMpAogGNwJYIAIgAykCgAY3AlAgAyACKQIwNwPQBSADIAIpAjg3A9gFIAMgASkCADcDwAUgAyABKQIINwPIBSAEIANB0AVqIANBwAVqEAUgASADKQKIBjcCCCABIAMpAoAGNwIAIAMgAikCIDcDsAUgAyACKQIoNwO4BSADIAIpAjA3A6AFIAMgAikCODcDqAUgBCADQbAFaiADQaAFahAFIAIgAykCiAY3AjggAiADKQKABjcCMCADIAIpAhA3A5AFIAMgAikCGDcDmAUgAyACKQIgNwOABSADIAIpAig3A4gFIAQgA0GQBWogA0GABWoQBSACIAMpAogGNwIoIAIgAykCgAY3AiAgAyACKQIANwPwBCADIAIpAgg3A/gEIAMgAikCEDcD4AQgAyACKQIYNwPoBCAEIANB8ARqIANB4ARqEAUgAiADKQKIBjcCGCACIAMpAoAGNwIQIAMgAykDkAY3A9AEIAMgAykDmAY3A9gEIAMgAikCADcDwAQgAyACKQIINwPIBCAEIANB0ARqIANBwARqEAUgAygCgAYhBSADKAKEBiEGIAMoAogGIQcgAiADKAKMBiARczYCDCACIAcgEHM2AgggAiAGIA9zNgIEIAIgACAFczYCACADIAIpAlg3A5gGIAMgAikCUDcDkAYgAyABKQIANwOwBCADIAEpAgg3A7gEIAMgAikCWDcDqAQgAyACKQJQNwOgBCAEIANBsARqIANBoARqEAUgAiADKQKIBjcCWCACIAMpAoAGNwJQIAMgAikCMDcDkAQgAyACKQI4NwOYBCADIAEpAgA3A4AEIAMgASkCCDcDiAQgBCADQZAEaiADQYAEahAFIAEgAykCiAY3AgggASADKQKABjcCACADIAIpAiA3A/ADIAMgAikCKDcD+AMgAyACKQIwNwPgAyADIAIpAjg3A+gDIAQgA0HwA2ogA0HgA2oQBSACIAMpAogGNwI4IAIgAykCgAY3AjAgAyACKQIQNwPQAyADIAIpAhg3A9gDIAMgAikCIDcDwAMgAyACKQIoNwPIAyAEIANB0ANqIANBwANqEAUgAiADKQKIBjcCKCACIAMpAoAGNwIgIAMgAikCADcDsAMgAyACKQIINwO4AyADIAIpAhA3A6ADIAMgAikCGDcDqAMgBCADQbADaiADQaADahAFIAIgAykCiAY3AhggAiADKQKABjcCECADIAMpA5AGNwOQAyADIAMpA5gGNwOYAyADIAIpAgA3A4ADIAMgAikCCDcDiAMgBCADQZADaiADQYADahAFIAMoAoAGIQUgAygChAYhBiADKAKIBiEHIAIgAygCjAYgFXM2AgwgAiAHIBRzNgIIIAIgBiATczYCBCACIAUgEnM2AgAgAyACKQJYNwOYBiADIAIpAlA3A5AGIAMgASkCADcD8AIgAyABKQIINwP4AiADIAIpAlg3A+gCIAMgAikCUDcD4AIgBCADQfACaiADQeACahAFIAIgAykCiAY3AlggAiADKQKABjcCUCADIAIpAjA3A9ACIAMgAikCODcD2AIgAyABKQIANwPAAiADIAEpAgg3A8gCIAQgA0HQAmogA0HAAmoQBSABIAMpAogGNwIIIAEgAykCgAY3AgAgAyACKQIgNwOwAiADIAIpAig3A7gCIAMgAikCMDcDoAIgAyACKQI4NwOoAiAEIANBsAJqIANBoAJqEAUgAiADKQKIBjcCOCACIAMpAoAGNwIwIAMgAikCEDcDkAIgAyACKQIYNwOYAiADIAIpAiA3A4ACIAMgAikCKDcDiAIgBCADQZACaiADQYACahAFIAIgAykCiAY3AiggAiADKQKABjcCICADIAIpAgA3A/ABIAMgAikCCDcD+AEgAyACKQIQNwPgASADIAIpAhg3A+gBIAQgA0HwAWogA0HgAWoQBSACIAMpAogGNwIYIAIgAykCgAY3AhAgAyADKQOQBjcD0AEgAyADKQOYBjcD2AEgAyACKQIANwPAASADIAIpAgg3A8gBIAQgA0HQAWogA0HAAWoQBSADKAKABiEFIAMoAoQGIQYgAygCiAYhByACIAMoAowGIApzNgIMIAIgByAJczYCCCACIAYgF3M2AgQgAiAFIBZzNgIAIAMgAikCWDcDmAYgAyACKQJQNwOQBiADIAEpAgA3A7ABIAMgASkCCDcDuAEgAyACKQJYNwOoASADIAIpAlA3A6ABIAQgA0GwAWogA0GgAWoQBSACIAMpAogGNwJYIAIgAykCgAY3AlAgAyACKQIwNwOQASADIAIpAjg3A5gBIAMgASkCADcDgAEgAyABKQIINwOIASAEIANBkAFqIANBgAFqEAUgASADKQKIBjcCCCABIAMpAoAGNwIAIAMgAikCIDcDcCADIAIpAig3A3ggAyACKQIwNwNgIAMgAikCODcDaCAEIANB8ABqIANB4ABqEAUgAiADKQKIBjcCOCACIAMpAoAGNwIwIAMgAikCEDcDUCADIAIpAhg3A1ggAyACKQIgNwNAIAMgAikCKDcDSCAEIANB0ABqIANBQGsQBSACIAMpAogGNwIoIAIgAykCgAY3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BSACIAMpAogCNwJYIAIgAykCgAI3AlAgAyACKQIwNwOQASADIAIpAjg3A5gBIAMgACkCADcDgAEgAyACKQJINwOIASAEIANBkAFqIANBgAFqEAUgAiADKQKIAjcCSCAAIAMpAoACNwIAIAMgAikCIDcDcCADIAIpAig3A3ggAyACKQIwNwNgIAMgAikCODcDaCAEIANB8ABqIANB4ABqEAUgAiADKQKIAjcCOCACIAMpAoACNwIwIAMgAikCEDcDUCADIAIpAhg3A1ggAyACKQIgNwNAIAMgAikCKDcDSCAEIANB0ABqIANBQGsQBSACIAMpAogCNwIoIAIgAykCgAI3AiAgAyACKQIANwMwIAMgAikCCDcDOCADIAIpAhA3AyAgAyACKQIYNwMoIAQgA0EwaiADQSBqEAUgAiADKQKIAjcCGCACIAMpAoACNwIQIAMgAykDkAI3AxAgAyADKQOYAjcDGCADIAIpAgA3AwAgAyACKQIINwMIIAQgA0EQaiADEAUgAiADKQKIAjcCCCACIAMpAoACNwIAIAIgByACKAIMczYCDCACIAYgAigCCHM2AgggAiAFIAIoAgRzNgIEIAIgECACKAIAczYCACAAIAggACgCAHM2AgAgAiALIAIoAkRzNgJEIAIgDiACKAJIczYCSCACIAEgAigCTHM2AkwgA0GgAmokAAuZDQESfyMAQaAEayICJAAgACgAPCEEIAAoADghBSAAKAA0IQYgACgAMCEHIAAoACAhCCAAKAAkIQkgACgAKCEKIAAoACwhCyAAKAAcIQwgACgAGCENIAAoABQhDiAAKAAQIQ8gACgABCEQIAAoAAghESAAKAAMIRIgACgAACETIAIgASkCeDcDmAQgAiABKQJwNwOQBCACIAEpAmA3A/ADIAIgASkCaDcD+AMgAiABKQJwNwPgAyACIAEpAng3A+gDIAJBgARqIgMgAkHwA2ogAkHgA2oQBSABIAIpAogENwJ4IAEgAikCgAQ3AnAgAiABKQJQNwPQAyACIAEpAlg3A9gDIAIgASkCYDcDwAMgAiABKQJoNwPIAyADIAJB0ANqIAJBwANqEAUgASACKQKIBDcCaCABIAIpAoAENwJgIAIgAUFAayIAKQIANwOwAyACIAEpAkg3A7gDIAIgASkCUDcDoAMgAiABKQJYNwOoAyADIAJBsANqIAJBoANqEAUgASACKQKIBDcCWCABIAIpAoAENwJQIAIgASkCMDcDkAMgAiABKQI4NwOYAyACIAApAgA3A4ADIAIgASkCSDcDiAMgAyACQZADaiACQYADahAFIAEgAikCiAQ3AkggACACKQKABDcCACACIAEpAiA3A/ACIAIgASkCKDcD+AIgAiABKQIwNwPgAiACIAEpAjg3A+gCIAMgAkHwAmogAkHgAmoQBSABIAIpAogENwI4IAEgAikCgAQ3AjAgAiABKQIQNwPQAiACIAEpAhg3A9gCIAIgASkCIDcDwAIgAiABKQIoNwPIAiADIAJB0AJqIAJBwAJqEAUgASACKQKIBDcCKCABIAIpAoAENwIgIAIgASkCADcDsAIgAiABKQIINwO4AiACIAEpAhA3A6ACIAIgASkCGDcDqAIgAyACQbACaiACQaACahAFIAEgAikCiAQ3AhggASACKQKABDcCECACIAIpA5AENwOQAiACIAIpA5gENwOYAiACIAEpAgA3A4ACIAIgASkCCDcDiAIgAyACQZACaiACQYACahAFIAEgAikCiAQ3AgggASACKQKABDcCACABIBIgASgCDHM2AgwgASARIAEoAghzNgIIIAEgECABKAIEczYCBCABIBMgASgCAHM2AgAgACAPIAAoAgBzNgIAIAEgDiABKAJEczYCRCABIA0gASgCSHM2AkggASAMIAEoAkxzNgJMIAIgASkCeDcDmAQgAiABKQJwNwOQBCACIAEpAmA3A/ABIAIgASkCaDcD+AEgAiABKQJwNwPgASACIAEpAng3A+gBIAMgAkHwAWogAkHgAWoQBSABIAIpAogENwJ4IAEgAikCgAQ3AnAgAiABKQJQNwPQASACIAEpAlg3A9gBIAIgASkCYDcDwAEgAiABKQJoNwPIASADIAJB0AFqIAJBwAFqEAUgASACKQKIBDcCaCABIAIpAoAENwJgIAIgACkCADcDsAEgAiABKQJINwO4ASACIAEpAlA3A6ABIAIgASkCWDcDqAEgAyACQbABaiACQaABahAFIAEgAikCiAQ3AlggASACKQKABDcCUCACIAEpAjA3A5ABIAIgASkCODcDmAEgAiAAKQIANwOAASACIAEpAkg3A4gBIAMgAkGQAWogAkGAAWoQBSABIAIpAogENwJIIAAgAikCgAQ3AgAgAiABKQIgNwNwIAIgASkCKDcDeCACIAEpAjA3A2AgAiABKQI4NwNoIAMgAkHwAGogAkHgAGoQBSABIAIpAogENwI4IAEgAikCgAQ3AjAgAiABKQIQNwNQIAIgASkCGDcDWCACIAEpAiA3A0AgAiABKQIoNwNIIAMgAkHQAGogAkFAaxAFIAEgAikCiAQ3AiggASACKQKABDcCICACIAEpAgA3AzAgAiABKQIINwM4IAIgASkCEDcDICACIAEpAhg3AyggAyACQTBqIAJBIGoQBSABIAIpAogENwIYIAEgAikCgAQ3AhAgAiACKQOQBDcDECACIAIpA5gENwMYIAIgASkCADcDACACIAEpAgg3AwggAyACQRBqIAIQBSABIAIpAogENwIIIAEgAikCgAQ3AgAgASALIAEoAgxzNgIMIAEgCiABKAIIczYCCCABIAkgASgCBHM2AgQgASAIIAEoAgBzNgIAIAAgByAAKAIAczYCACABIAYgASgCRHM2AkQgASAFIAEoAkhzNgJIIAEgBCABKAJMczYCTCACQaAEaiQAC5wJAQt/IwBBoAJrIgMkACABKAAEIQogASgACCELIAEoAAwhDCAAKAAEIQYgACgACCEHIAAoAAwhCCABKAAAIQ0gAiAAKAAAIgFBgIKEEHMiADYCcCACIAFB2/vgqAVzNgJgIAIgADYCUCACQUBrIgAgASANcyIFNgIAIAJCoKLEkbSurZRdNwI4IAJC2/vgqNXN8JdxNwIwIAJClcTcyYWy+rziADcCKCACQoCChJCwoIGEDTcCICACQqCixJG0rq2UXTcCGCACQtv74KjVzfCXcTcCECACIAU2AgAgAiAIQZDT55MGcyIFNgJ8IAIgB0GVxNzJBXMiBDYCeCACIAZBg4qg6ABzIgk2AnQgAiAIQfPqoul9czYCbCACIAdBoKLEkQRzNgJoIAIgBkHthL+Jf3M2AmQgAiAFNgJcIAIgBDYCWCACIAk2AlQgAiAIIAxzIgU2AkwgAiAHIAtzIgQ2AkggAiAGIApzIgk2AkQgAiAFNgIMIAIgBDYCCCACIAk2AgRBACEFA0AgAyACKQJ4NwOYAiADIAIpAnA3A5ACIAMgAikCYDcD8AEgAyACKQJoNwP4ASADIAIpAnA3A+ABIAMgAikCeDcD6AEgA0GAAmoiBCADQfABaiADQeABahAFIAIgAykCiAI3AnggAiADKQKAAjcCcCADIAIpAlA3A9ABIAMgAikCWDcD2AEgAyACKQJgNwPAASADIAIpAmg3A8gBIAQgA0HQAWogA0HAAWoQBSACIAMpAogCNwJoIAIgAykCgAI3AmAgAyAAKQIANwOwASADIAApAgg3A7gBIAMgAikCUDcDoAEgAyACKQJYNwOoASAEIANBsAFqIANBoAFqEAUgAiADKQKIAjcCWCACIAMpAoACNwJQIAMgAikCMDcDkAEgAyACKQI4NwOYASADIAApAgA3A4ABIAMgACkCCDcDiAEgBCADQZABaiADQYABahAFIAAgAykCiAI3AgggACADKQKAAjcCACADIAIpAiA3A3AgAyACKQIoNwN4IAMgAikCMDcDYCADIAIpAjg3A2ggBCADQfAAaiADQeAAahAFIAIgAykCiAI3AjggAiADKQKAAjcCMCADIAIpAhA3A1AgAyACKQIYNwNYIAMgAikCIDcDQCADIAIpAig3A0ggBCADQdAAaiADQUBrEAUgAiADKQKIAjcCKCACIAMpAoACNwIgIAMgAikCADcDMCADIAIpAgg3AzggAyACKQIQNwMgIAMgAikCGDcDKCAEIANBMGogA0EgahAFIAIgAykCiAI3AhggAiADKQKAAjcCECADIAMpA5ACNwMQIAMgAykDmAI3AxggAyACKQIANwMAIAMgAikCCDcDCCAEIANBEGogAxAFIAIgAykCiAI3AgggAiADKQKAAjcCACACIAIoAgwgDHM2AgwgAiACKAIIIAtzNgIIIAIgAigCBCAKczYCBCACIAIoAgAgDXM2AgAgACAAKAIAIAFzNgIAIAIgAigCRCAGczYCRCACIAIoAkggB3M2AkggAiACKAJMIAhzNgJMIAVBAWoiBUEKRw0ACyADQaACaiQAC7UFAQl/IwBBgAFrIgMkAEHixAItAAAhBCAAQgA3AgQgAEEBNgIAIABCADcCDCAAQgA3AhQgAEIANwIcIABCgICAgBA3AiQgAEEsakEAQcwA/AsAIAAgAUHAB2xBkBVqIgFB4sQCLQAAQQJ2IAIgAkEAIARBAnYgAkGAAXFBB3ZzIgRrcUEBdGsiAkEBc0H/AXFBAWtBH3ZzEB0gACABQfgAakHixAItAABBAnYgAkECc0H/AXFBAWtBH3ZzEB0gACABQfABakHixAItAABBAnYgAkEDc0H/AXFBAWtBH3ZzEB0gACABQegCakHixAItAABBAnYgAkEEc0H/AXFBAWtBH3ZzEB0gACABQeADakHixAItAABBAnYgAkEFc0H/AXFBAWtBH3ZzEB0gACABQdgEakHixAItAABBAnYgAkEGc0H/AXFBAWtBH3ZzEB0gACABQdAFakHixAItAABBAnYgAkEHc0H/AXFBAWtBH3ZzEB0gACABQcgGakHixAItAABBAnYgAkEIc0H/AXFBAWtBH3ZzEB0gAyAAKQJINwMoIAMgAEFAaykCADcDICADIAApAjg3AxggAyAAKQIwNwMQIAMgACkCKDcDCCADIAApAgA3AzAgAyAAKQIINwM4IAMgACkCEDcDQCADIAApAhg3A0ggAyAAKQIgNwNQIAAoAlAhASAAKAJUIQIgACgCWCEFIAAoAlwhBiAAKAJgIQcgACgCZCEIIAAoAmghCSAAKAJsIQogACgCcCELIANBACAAKAJ0azYCfCADQQAgC2s2AnggA0EAIAprNgJ0IANBACAJazYCcCADQQAgCGs2AmwgA0EAIAdrNgJoIANBACAGazYCZCADQQAgBWs2AmAgA0EAIAJrNgJcIANBACABazYCWCAAIANBCGogBBAdIANBgAFqJAAL8AkBHn8gASgCKCEDIAEoAgQhBCABKAIsIQUgASgCCCEGIAEoAjAhByABKAIMIQggASgCNCEJIAEoAhAhCiABKAI4IQsgASgCFCEMIAEoAjwhDSABKAIYIQ4gAUFAayIPKAIAIRAgASgCHCERIAEoAkQhEiABKAIgIRMgASgCSCEUIAEoAgAhFSAAIAEoAiQgASgCTGo2AiQgACATIBRqNgIgIAAgESASajYCHCAAIA4gEGo2AhggACAMIA1qNgIUIAAgCiALajYCECAAIAggCWo2AgwgACAGIAdqNgIIIAAgBCAFajYCBCAAIAMgFWo2AgAgASgCKCEFIAEoAgQhAyABKAIsIQYgASgCCCEHIAEoAjAhCCABKAIMIQkgASgCNCEKIAEoAhAhCyABKAI4IQwgASgCFCENIAEoAjwhDiABKAIYIRAgDygCACEPIAEoAhwhBCABKAJEIREgASgCICESIAEoAkghEyABKAIAIRQgACABKAJMIAEoAiRrNgJMIAAgEyASazYCSCAAIBEgBGs2AkQgAEFAayIEIA8gEGs2AgAgACAOIA1rNgI8IAAgDCALazYCOCAAIAogCWs2AjQgACAIIAdrNgIwIAAgBiADazYCLCAAQShqIgMgBSAUazYCACAAQdAAaiAAIAJBKGoQBiADIAMgAhAGIABB+ABqIAJB+ABqIAFB+ABqEAYgACABQdAAaiACQdAAahAGIAAoAgQhFSAAKAIIIRYgACgCDCEXIAAoAhAhGCAAKAIUIRkgACgCGCEaIAAoAhwhGyAAKAIgIRwgACgCJCEdIAMoAgAhASAAKAJQIQIgACgCLCEFIAAoAlQhBiAAKAIwIQcgACgCWCEIIAAoAjQhCSAAKAJcIQogACgCOCELIAAoAmAhDCAAKAI8IQ0gACgCZCEOIAQoAgAhDyAAKAJoIRAgACgCRCERIAAoAmwhEiAAKAJIIRMgACgCcCEUIAAoAgAhHiAAIAAoAkwiHyAAKAJ0IiBqNgJMIAAgEyAUajYCSCAAIBEgEmo2AkQgBCAPIBBqNgIAIAAgDSAOajYCPCAAIAsgDGo2AjggACAJIApqNgI0IAAgByAIajYCMCAAIAUgBmo2AiwgAyABIAJqNgIAIAAgICAfazYCJCAAIBQgE2s2AiAgACASIBFrNgIcIAAgECAPazYCGCAAIA4gDWs2AhQgACAMIAtrNgIQIAAgCiAJazYCDCAAIAggB2s2AgggACAGIAVrNgIEIAAgAiABazYCACAAIAAoApwBIgEgHUEBdCICajYCnAEgACAAKAKYASIDIBxBAXQiBGo2ApgBIAAgACgClAEiBSAbQQF0IgZqNgKUASAAIAAoApABIgcgGkEBdCIIajYCkAEgACAAKAKMASIJIBlBAXQiCmo2AowBIAAgACgCiAEiCyAYQQF0IgxqNgKIASAAIAAoAoQBIg0gF0EBdCIOajYChAEgACAAKAKAASIPIBZBAXQiEGo2AoABIAAgACgCfCIRIBVBAXQiEmo2AnwgACAAKAJ4IhMgHkEBdCIUajYCeCAAIAQgA2s2AnAgACAGIAVrNgJsIAAgCCAHazYCaCAAIAogCWs2AmQgACAMIAtrNgJgIAAgDiANazYCXCAAIBAgD2s2AlggACASIBFrNgJUIAAgFCATazYCUCAAIAIgAWs2AnQLEgAgACABIAKtIAOtQiCGhBAYC64OARd/IwBBwAJrIgMkACAAQShqIgkgARCAASAAQgA3AlQgAEEBNgJQIABCADcCXCAAQgA3AmQgAEIANwJsIABBADYCdCADQfABaiIIIAkQBCADQcABaiIGIAhBwAoQBkF/IQogAyADKALwAUEBayILNgLwASADIAMoAsABQQFqNgLAASADKAL0ASEMIAMoAvgBIQ0gAygC/AEhDiADKAKAAiEPIAMoAoQCIRAgAygCiAIhESADKAKMAiESIAMoApACIRMgAygClAIhFCADQZABaiIHIAYQBCAHIAcgBhAGIAAgBxAEIAAgACAGEAYgACAAIAgQBiMAQZABayIEJAAgBEHgAGoiBSAAEAQgBEEwaiICIAUQBCACIAIQBCACIAAgAhAGIAUgBSACEAYgBSAFEAQgBSACIAUQBiACIAUQBCACIAIQBCACIAIQBCACIAIQBCACIAIQBCAFIAIgBRAGIAIgBRAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAiAFEAYgBCACEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgBCAEEAQgAiAEIAIQBiACIAIQBCACIAIQBCACIAIQBCACIAIQBCACIAIQBCACIAIQBCACIAIQBCACIAIQBCACIAIQBCACIAIQBCAFIAIgBRAGIAIgBRAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAhAEIAIgAiAFEAYgBCACEARBASECA0AgBCAEEAQgAkEBaiICQeQARw0ACyAEQTBqIgIgBCACEAYgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgAiACEAQgBEHgAGoiBSACIAUQBiAFIAUQBCAFIAUQBCAAIAUgABAGIARBkAFqJAAgACAAIAcQBiAAIAAgCBAGIANB4ABqIgIgABAEIAIgAiAGEAYgAyADKAKEASICIBRrNgJUIAMgAygCgAEiBCATazYCUCADIAMoAnwiBSASazYCTCADIAMoAngiBiARazYCSCADIAMoAnQiByAQazYCRCADIAMoAnAiCCAPazYCQCADIAMoAmwiFSAOazYCPCADIAMoAmgiFiANazYCOCADIAMoAmQiFyAMazYCNCADIAMoAmAiGCALazYCMCADIANBMGoQGgJAIANBIBAoRQRAIAMgAiAUajYCJCADIAQgE2o2AiAgAyAFIBJqNgIcIAMgBiARajYCGCADIAcgEGo2AhQgAyAIIA9qNgIQIAMgDiAVajYCDCADIA0gFmo2AgggAyAMIBdqNgIEIAMgCyAYajYCACADQaACaiICIAMQGiACQSAQKEUNASAAIABB8AoQBgsgA0GgAmogABAaIAMtAKACQQFxIAEtAB9BB3ZGBEAgAEEAIAAoAgBrNgIAIABBACAAKAIkazYCJCAAQQAgACgCIGs2AiAgAEEAIAAoAhxrNgIcIABBACAAKAIYazYCGCAAQQAgACgCFGs2AhQgAEEAIAAoAhBrNgIQIABBACAAKAIMazYCDCAAQQAgACgCCGs2AgggAEEAIAAoAgRrNgIECyAAQfgAaiAAIAkQBkEAIQoLIANBwAJqJAAgCgstAQF+IAKtIAOtQiCGhCIGQhBaBH8gACABQRBqIAEgBkIQfSAEIAUQRQVBfwsLGAAgACABIAIgA60gBK1CIIaEIAUgBhBFCxgAIAAgASACIAOtIAStQiCGhCAFIAYQMwtKAQJ/IwBBIGsiBiQAQX8hBwJAIAJCEFQNACAGIAQgBRAxDQAgACABQRBqIAEgAkIQfSADIAYQRSEHIAZBIBAHCyAGQSBqJAAgBwtPAQJ/IwBBIGsiBiQAIAJC8P///w9UBEBBfyEHIAYgBCAFEDFFBEAgAEEQaiAAIAEgAiADIAYQMyEHIAZBIBAHCyAGQSBqJAAgBw8LEAoAC6cIAQV/AkAgACABTw0AIABFDQAgAUUNACACRQ0AAkACQCAALQAAQTBrQf8BcSIDQQlLIgYEQEEAIQMgACEEDAELIABBAWohBAJAIAEgAGsiBUEBRg0AIAQtAABBMGtB/wFxIgdBCUsNASADQQpsIAdqIgNB/wFLDQMgAEECaiEEIAVBAkYNACAELQAAQTBrQf8BcSIHQQlLDQEgA0EKbCAHaiIDQf8BSw0DIABBA2ohBCAFQQNGDQAgBC0AAEEwa0H/AXFBCk8NAQwDCyABIQAMAQsgBCEAIAYNAQsgAiADOgAAIAEgBE0NACAALQAAQS5HDQAgASAAQQFqIgRrIgNBACABIANPGyEGAkAgASAETQRAQQAhBSAGIQMMAQtBACEFQQAhAyAELQAAQTBrQf8BcSIHQQpPDQAgAEECaiEEQQEhAyAGQQFGBEAgByEFIAYhAwwBCyAELQAAQTBrQf8BcSIFQQlLBEAgByEFDAELIAdBCmwgBWoiBUH/AUsNASAAQQNqIQRBAiEDIAZBAkYEQCAGIQMMAQsgBC0AAEEwa0H/AXEiB0EJSw0AIAVBCmwgB2oiBUH/AUsNASAAQQRqIQRBAyEDIAZBA0YEQCAGIQMMAQsgBC0AAEEwa0H/AXFBCkkNAQsgA0UEQEEADwsgAiAFOgABIAEgBE0EQEEADwsgBC0AAEEuRw0AIAEgBEEBaiIAayIDQQAgASADTxshBgJAIAAgAU8EQEEAIQUgBiEDDAELQQAhBUEAIQMgAC0AAEEwa0H/AXEiB0EKTw0AIARBAmohAEEBIQMgBkEBRgRAIAchBSAGIQMMAQsgAC0AAEEwa0H/AXEiBUEJSwRAIAchBQwBCyAHQQpsIAVqIgVB/wFLDQEgBEEDaiEAQQIhAyAGQQJGBEAgBiEDDAELIAAtAABBMGtB/wFxIgdBCUsNACAFQQpsIAdqIgVB/wFLDQEgBEEEaiEAQQMhAyAGQQNGBEAgBiEDDAELIAAtAABBMGtB/wFxQQpJDQELIANFBEBBAA8LIAIgBToAAiAAIAFPBEBBAA8LIAAtAABBLkcNAEEAIQYgASAAQQFqIgRrIgNBACABIANPGyEFAkAgASAETQRAIAUhAwwBC0EAIQMgBC0AAEEwa0H/AXEiB0EKTw0AIABBAmohBEEBIQMgBUEBRgRAIAchBiAFIQMMAQsgBC0AAEEwa0H/AXEiBkEJSwRAIAchBgwBCyAHQQpsIAZqIgZB/wFLDQEgAEEDaiEEQQIhAyAFQQJGBEAgBSEDDAELIAQtAABBMGtB/wFxIgdBCUsNACAGQQpsIAdqIgZB/wFLDQEgAEEEaiEEQQMhAyAFQQNGBEAgBSEDDAELIAQtAABBMGtB/wFxQQpJDQELIANFDQAgAiAGOgADIAEgBEYPC0EAC/QEARl+IAExAB8hAiABMQAeIQYgATEAHSEOIAExAAYhByABMQAFIQggATEABCEDIAExAAkhDyABMQAIIRAgATEAByERIAExAAwhCSABMQALIQogATEACiELIAExAA8hDCABMQAOIRIgATEADSETIAExABwhBCABMQAbIRQgATEAGiEVIAExABkhBSABMQAYIRYgATEAFyEXIAE1AAAhGCAAIAExABVCD4YgATEAFEIHhoQgATEAFkIXhoQgATUAECIZQoCAgAh8IhpCGYh8Ig0gDUKAgIAQfCINQoCAgOAPg30+AhggACAWQg2GIBdCBYaEIAVCFYaEIgUgDUIaiHwgBUKAgIAIfCIFQoCAgPADg30+AhwgACAUQgyGIBVCBIaEIARCFIaEIAVCGYh8IgQgBEKAgIAQfCIEQoCAgOAPg30+AiAgACAZIBpCgICA8A+DfSASQgqGIBNCAoaEIAxCEoaEIApCC4YgC0IDhoQgCUIThoQiCUKAgIAIfCIKQhmIfCILQoCAgBB8IgxCGoh8PgIUIAAgCyAMQoCAgOAPg30+AhAgACAQQg2GIBFCBYaEIA9CFYaEIAhCDoYgA0IGhoQgB0IWhoQiB0KAgIAIfCIIQhmIfCIDIANCgICAEHwiA0KAgIDgD4N9PgIIIAAgAkIShkKAgPAPgyAGQgqGIA5CAoaEhCICIARCGoh8IAJCgICACHwiAkKAgIAQg30+AiQgACADQhqIIAl8IApCgICA8ACDfT4CDCAAIAcgCEKAgIDwB4N9IBggAkIZiEITfnwiAkKAgIAQfCIGQhqIfD4CBCAAIAIgBkKAgIDgD4N9PgIAC4ECAQV/IwBBEGsiBSQAIAAtAOQBRQRAIAUCfwJAAkACQCAAKALgASIDQacBaw4CAAECCyAALQDlAUGAf3MMAgsgABAXQQAhAyAAQQA2AuABCyAAIABB5QFqIANBARANQYABCzoADyAAIAVBD2pBpwFBARANIAAQFyAAQQE6AOQBIABBADYC4AELIAIEQCAAKALgASEDA0AgA0GoAUYEQCAAEBcgAEEANgLgAUEAIQMLQagBIANrIgQgAiAGayIHIAQgB0kbIgQEQCABIAZqIAAgA2ogBPwKAAALIAAgACgC4AEgBGoiAzYC4AEgBCAGaiIGIAJJDQALCyAFQRBqJABBAAunAgEDfyMAQeACayIIJAAgCEEgaiIKQsAAIAYgBxAmIAhB4ABqIgkgCkG8uQIoAgARAQAaIApBwAAQByAJIAQgBUHAuQIoAgARAAAaIAlBkLkCQgAgBX1CD4NBwLkCKAIAEQAAGiAJIAEgAkHAuQIoAgARAAAaIAlBkLkCQgAgAn1CD4NBwLkCKAIAEQAAGiAIIAU3AxggCSAIQRhqIgRCCEHAuQIoAgARAAAaIAggAjcDGCAJIARCCEHAuQIoAgARAAAaIAkgCEHEuQIoAgARAQAaIAlBgAIQByAIIAMQKyEEIAhBEBAHAkAgAEUNACAEBEAgAqciAQRAIABBACAB/AsAC0F/IQQMAQsgACABIAIgBkEBIAcQJ0EAIQQLIAhB4AJqJAAgBAv8AQEDfyMAQeACayIIJAAgCEEgaiIKQsAAIAYgB0HouQIoAgAREQAaIAhB4ABqIgkgCkG8uQIoAgARAQAaIApBwAAQByAJIAQgBUHAuQIoAgARAAAaIAggBTcDGCAJIAhBGGoiBEIIQcC5AigCABEAABogCSABIAJBwLkCKAIAEQAAGiAIIAI3AxggCSAEQghBwLkCKAIAEQAAGiAJIAhBxLkCKAIAEQEAGiAJQYACEAcgCCADECshBCAIQRAQBwJAIABFDQAgBARAIAKnIgEEQCAAQQAgAfwLAAtBfyEEDAELIAAgASACIAYgBxBpQQAhBAsgCEHgAmokACAEC/0BAQN/IwBB0AJrIgokACAKQRBqIgtCwAAgByAIECYgCkHQAGoiCSALQby5AigCABEBABogC0HAABAHIAkgBSAGQcC5AigCABEAABogCUGQuQJCACAGfUIPg0HAuQIoAgARAAAaIAAgAyAEIAdBASAIECcgCSAAIARBwLkCKAIAEQAAGiAJQZC5AkIAIAR9Qg+DQcC5AigCABEAABogCiAGNwMIIAkgCkEIaiIAQghBwLkCKAIAEQAAGiAKIAQ3AwggCSAAQghBwLkCKAIAEQAAGiAJIAFBxLkCKAIAEQEAGiAJQYACEAcgAgRAIAJCEDcDAAsgCkHQAmokAEEAC9IBAQN/IwBB0AJrIgkkACAJQRBqIgtCwAAgByAIQei5AigCABERABogCUHQAGoiCiALQby5AigCABEBABogC0HAABAHIAogBSAGQcC5AigCABEAABogCSAGNwMIIAogCUEIaiIFQghBwLkCKAIAEQAAGiAAIAMgBCAHIAgQaSAKIAAgBEHAuQIoAgARAAAaIAkgBDcDCCAKIAVCCEHAuQIoAgARAAAaIAogAUHEuQIoAgARAQAaIApBgAIQByACBEAgAkIQNwMACyAJQdACaiQAQQALgQIBBX8jAEEQayIFJAAgAC0A5AFFBEAgBQJ/AkACQAJAIAAoAuABIgNBhwFrDgIAAQILIAAtAOUBQYB/cwwCCyAAEBdBACEDIABBADYC4AELIAAgAEHlAWogA0EBEA1BgAELOgAPIAAgBUEPakGHAUEBEA0gABAXIABBAToA5AEgAEEANgLgAQsgAgRAIAAoAuABIQMDQCADQYgBRgRAIAAQFyAAQQA2AuABQQAhAwtBiAEgA2siBCACIAZrIgcgBCAHSRsiBARAIAEgBmogACADaiAE/AoAAAsgACAAKALgASAEaiIDNgLgASAEIAZqIgYgAkkNAAsLIAVBEGokAEEAC9wCAQJ/IwBBkANrIggkACAIQQA2AgQgCEEQaiIJIAYgBxBUIAggBikAEDcCCCAIQdAAaiIHQsAAIAhBBGogCRAmIAhBkAFqIgYgB0G8uQIoAgARAQAaIAdBwAAQByAGIAQgBUHAuQIoAgARAAAaIAZB0LgCQgAgBX1CD4NBwLkCKAIAEQAAGiAGIAEgAkHAuQIoAgARAAAaIAZB0LgCQgAgAn1CD4NBwLkCKAIAEQAAGiAIIAU3A0ggBiAIQcgAaiIEQghBwLkCKAIAEQAAGiAIIAI3A0ggBiAEQghBwLkCKAIAEQAAGiAGIAhBMGoiBEHEuQIoAgARAQAaIAZBgAIQByAEIAMQKyEGIARBEBAHAkAgAEUNACAGBEAgAqciAQRAIABBACAB/AsAC0F/IQYMAQsgACABIAIgCEEEaiAIQRBqEGhBACEGCyAIQRBqQSAQByAIQZADaiQAIAYLpwIBA38jAEGAA2siCSQAIAlBADYCBCAJQRBqIgogByAIEFQgCSAHKQAQNwIIIAlBQGsiCELAACAJQQRqIgsgChAmIAlBgAFqIgcgCEG8uQIoAgARAQAaIAhBwAAQByAHIAUgBkHAuQIoAgARAAAaIAdB0LgCQgAgBn1CD4NBwLkCKAIAEQAAGiAAIAMgBCALIAoQaCAHIAAgBEHAuQIoAgARAAAaIAdB0LgCQgAgBH1CD4NBwLkCKAIAEQAAGiAJIAY3AzggByAJQThqIgBCCEHAuQIoAgARAAAaIAkgBDcDOCAHIABCCEHAuQIoAgARAAAaIAcgAUHEuQIoAgARAQAaIAdBgAIQByACBEAgAkIQNwMACyAJQRBqQSAQByAJQYADaiQAQQALmQcBB38jAEHQAmsiAyQAIAEoAAQhBCABKAAIIQUgASgADCEGIAIoAgQhByACKAIIIQggAigCDCEJIAAgAigCACABKAAAczYCACAAIAYgCXM2AgwgACAFIAhzNgIIIAAgBCAHczYCBCADIAApAgA3A7ACIAMgACkCCDcDuAIgAyACKQIQNwOgAiADIAIpAhg3A6gCIANBwAJqIgEgA0GwAmogA0GgAmoQBSAAIAMpAsgCNwIIIAAgAykCwAI3AgAgAyAAKQIANwOQAiADIAApAgg3A5gCIAMgAikCIDcDgAIgAyACKQIoNwOIAiABIANBkAJqIANBgAJqEAUgACADKQLIAjcCCCAAIAMpAsACNwIAIAMgACkCADcD8AEgAyAAKQIINwP4ASADIAIpAjA3A+ABIAMgAikCODcD6AEgASADQfABaiADQeABahAFIAAgAykCyAI3AgggACADKQLAAjcCACADIAApAgA3A9ABIAMgACkCCDcD2AEgAyACQUBrKQIANwPAASADIAIpAkg3A8gBIAEgA0HQAWogA0HAAWoQBSAAIAMpAsgCNwIIIAAgAykCwAI3AgAgAyAAKQIANwOwASADIAApAgg3A7gBIAMgAikCUDcDoAEgAyACKQJYNwOoASABIANBsAFqIANBoAFqEAUgACADKQLIAjcCCCAAIAMpAsACNwIAIAMgACkCADcDkAEgAyAAKQIINwOYASADIAIpAmA3A4ABIAMgAikCaDcDiAEgASADQZABaiADQYABahAFIAAgAykCyAI3AgggACADKQLAAjcCACADIAApAgA3A3AgAyAAKQIINwN4IAMgAikCcDcDYCADIAIpAng3A2ggASADQfAAaiADQeAAahAFIAAgAykCyAI3AgggACADKQLAAjcCACADIAApAgA3A1AgAyAAKQIINwNYIAMgAikCgAE3A0AgAyACKQKIATcDSCABIANB0ABqIANBQGsQBSAAIAMpAsgCNwIIIAAgAykCwAI3AgAgAyAAKQIANwMwIAMgACkCCDcDOCADIAIpApABNwMgIAMgAikCmAE3AyggASADQTBqIANBIGoQBSAAIAMpAsgCNwIIIAAgAykCwAI3AgAgAyAAKQIANwMQIAMgACkCCDcDGCADIAIpAqABNwMAIAMgAikCqAE3AwggASADQRBqIAMQISAAIAMpAsgCNwIIIAAgAykCwAI3AgAgA0HQAmokAAuwAwEFfyMAQaAfayIDJAAgA0GgHWoiBEHgACACQiAQSRogAyADKQPYHTcDmB0gAyADKQPQHTcDkB0gAyADKQPIHTcDiB0gAyADKQPAHTcDgB0gAyADKQO4HTcD+BwgAyADKQOwHTcD8BwgAyADKQOoHTcD6BwgAyADKQOgHTcD4BwgAyADKQPgHTcDICADIAMpA+gdNwMoIAMgAykD8B03AzAgAyADKQP4HTcDOCADQcATaiADQeAAaiIGIANB4BxqIgUQNRogA0FAayADQSBqIgdBzLkCKAIAEQEAGiAEQeAAEAcgBUHAABAHQX8hAiAFIAEgBhCRAUUEQCADIAcgAUHACGoiBBApBH8gBQUgA0GgHWoiAUEAQcgB/AsAIAFBADoA7AEgAUEgNgLoASABQoCAgICAETcD4AEgASADQeAcaiICQiAQGBog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CiALKQI4NwOYASAKIBApAgA3A4ABIAogCykCSDcDiAEgASAKQZABaiAKQYABahAFIAsgCikC2AE3AkggECAKKQLQATcCACAKIAspAiA3A3AgCiALKQIoNwN4IAogCykCMDcDYCAKIAspAjg3A2ggASAKQfAAaiAKQeAAahAFIAsgCikC2AE3AjggCyAKKQLQATcCMCAKIAspAhA3A1AgCiALKQIYNwNYIAogCykCIDcDQCAKIAspAig3A0ggASAKQdAAaiAKQUBrEAUgCyAKKQLYATcCKCALIAopAtABNwIgIAogCykCADcDMCAKIAspAgg3AzggCiALKQIQNwMgIAogCykCGDcDKCABIApBMGogCkEgahAFIAsgCikC2AE3AhggCyAKKQLQATcCECAKIAopA+ABNwMQIAogCikD6AE3AxggCiALKQIANwMAIAogCykCCDcDCCABIApBEGogChAFIAooAtABIQcgCigC1AEhBSAKKALYASEBIAsgCCAKKALcAXM2AgwgCyABIAxzNgIIIAsgBSANczYCBCALIAcgD3M2AgAgCkHwAWokAAsgCUGAA2ogBCAGrSACrSAJQbADahBrQX8hBwJAAkACQAJ/AkACQCAEQRBrDhEAAwMDAwMDAwMDAwMDAwMDAQMLIAlBgANqIAMQKwwBCyAJQYADaiADEEwLIgdFDQELIABFDQEgAkUNASAAQQAgAvwLAAwBC0EAIQcLIAlBoARqJAAgBwvaAQEDfyMAQRBrIgUkAAJAAkAgA0UEQEF/IQEMAQsCfyADIANBAWsiBnFFBEAgBiACQX9zIgdxDAELIAJBf3MhByAGIAIgA3BrCyIGIAdPDQEgBCACIAZqIgJNBEBBfyEBDAELIAAEQCAAIAJBAWo2AgALIAEgAmohAEEAIQEgBUEAOgAPQQAhAgNAIAAgAmsiBCAELQAAIAUtAA9xIAIgBnNBAWtBGHYiBEGAAXFyOgAAIAUgBS0ADyAEcjoADyACQQFqIgIgA0cNAAsLIAVBEGokACABDwsQCgALogwCBX8CfiMAQZAEayIJJAAgCCAHIAlBkANqEG5BACEIIAZBH0sEQEEgIQcDQCAFIAhqIAlBkANqEG0gByIIQSBqIgcgBk0NAAsLIAYgCEEQciIHTwRAA0AgBSAIaiIIKAAAIQsgCCgABCEMIAgoAAghDSAI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AGogBBBAIAGnIgZBA3EhB0EAIQMgAUIEWgRAIAZBPHEhCEEAIQYDQCAAIANqIARBIGoiCSIFIANqLQAAOgAAIAAgA0EBciIKaiAFIApqLQAAOgAAIAAgA0ECciIFaiAFIAlqLQAAOgAAIAAgA0EDciIFaiAEQSBqIAVqLQAAOgAAIANBBGohAyAGQQRqIgYgCEcNAAsgB0UNAQsDQCAAIANqIARBIGogA2otAAA6AAAgA0EBaiEDIAJBAWoiAiAHRw0ACwsgBEEgakHAABAHIARBIBAHCyAEQfAAaiQAQQALhgYBFH8jAEGwAmsiAiQAIAAgAS0AADoAACAAIAEtAAE6AAEgACABLQACOgACIAAgAS0AAzoAAyAAIAEtAAQ6AAQgACABLQAFOgAFIAAgAS0ABjoABiAAIAEtAAc6AAcgACABLQAIOgAIIAAgAS0ACToACSAAIAEtAAo6AAogACABLQALOgALIAAgAS0ADDoADCAAIAEtAA06AA0gACABLQAOOgAOIAAgAS0ADzoADyAAIAEtABA6ABAgACABLQAROgARIAAgAS0AEjoAEiAAIAEtABM6ABMgACABLQAUOgAUIAAgAS0AFToAFSAAIAEtABY6ABYgACABLQAXOgAXIAAgAS0AGDoAGCAAIAEtABk6ABkgACABLQAaOgAaIAAgAS0AGzoAGyAAIAEtABw6ABwgACABLQAdOgAdIAAgAS0AHjoAHiABLQAfIQEgACAALQAAQfgBcToAACAAIAFBP3FBwAByOgAfIAJBMGogABBCIAIoAoABIQEgAigCWCEDIAIoAoQBIQQgAigCXCEFIAIoAogBIQYgAigCYCEHIAIoAowBIQggAigCZCEJIAIoApABIQogAigCaCELIAIoApQBIQwgAigCbCENIAIoApgBIQ4gAigCcCEPIAIoApwBIRAgAigCdCERIAIoAqABIRIgAigCeCETIAIgAigCfCIUIAIoAqQBIhVqNgKkAiACIBIgE2o2AqACIAIgECARajYCnAIgAiAOIA9qNgKYAiACIAwgDWo2ApQCIAIgCiALajYCkAIgAiAIIAlqNgKMAiACIAYgB2o2AogCIAIgBCAFajYChAIgAiABIANqNgKAAiACIBUgFGs2AvQBIAIgEiATazYC8AEgAiAQIBFrNgLsASACIA4gD2s2AugBIAIgDCAN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AsQBIAMgBCAMajYCwAEgAyAHIA9qNgLMASADQeAAaiIaIANBMGoiDCADQfABaiIFEAYgA0HAAWoiBCAEIAMQBiAMIAMQBCADIAUQBCADKALAASECIAMoAmAhBiADKALEASEKIAMoAmQhByADKALIASEIIAMoAmghCSADKALMASELIAMoAmwhDSADKALQASEXIAMoAnAhDiADKALUASEPIAMoAnQhECADKALYASEUIAMoAnghESADKALcASESIAMoAnwhEyADKALgASEVIAMoAoABIRggAyADKALkASIZIAMoAoQBIhtqNgK0ASADIBUgGGo2ArABIAMgEiATajYCrAEgAyARIBRqNgKoASADIA8gEGo2AqQBIAMgDiAXajYCoAEgAyALIA1qNgKcASADIAggCWo2ApgBIAMgByAKajYClAEgAyACIAZqNgKQASADIBsgGWs2AuQBIAMgGCAVazYC4AEgAyATIBJrNgLcASADIBEgFGs2AtgBIAMgECAPazYC1AEgAyAOIBdrNgLQASADIA0gC2s2AswBIAMgCSAIazYCyAEgAyAHIAprNgLEASADIAYgAms2AsABIAUgAyAMEAYgAygCSCECIAMoAhghDiADKAJEIQYgAygCFCEPIAMoAkAhCiADKAIQIRAgAygCPCEHIAMoAgwhFCADKAI4IQggAygCCCERIAMoAjQhCSADKAIEIRIgAygCVCELIAMoAiQhEyADKAIwIQ0gAygCACEVIAMoAkwhFyADKAIcIRggAyADKAIgIAMoAlAiGWsiGzYCICADIBggF2siGDYCHCADIBUgDWsiFTYCACADIBMgC2siEzYCJCADIBIgCWsiEjYCBCADIBEgCGsiETYCCCADIBQgB2siFDYCDCADIBAgCmsiEDYCECADIA8gBmsiDzYCFCADIA4gAmsiDjYCGCAEIAQQBCADQZABaiIcIBwQBCADIBkgG6xCwrYHfiAYrELCtgd+IkBCgICACHwiQkIZh3wiQSBBQoCAgBB8IkFCgICA4A+DfadqNgJQIAMgAiAOrELCtgd+IA+sQsK2B34iRkKAgIAIfCJHQhmHfCJDIENCgICAEHwiQ0KAgIDgD4N9p2o2AkggAyAKIBCsQsK2B34gFKxCwrYHfiJIQoCAgAh8IklCGYd8IkQgREKAgIAQfCJEQoCAgOAPg32najYCQCADIAggEaxCwrYHfiASrELCtgd+IkpCgICACHwiS0IZh3wiRSBFQoCAgBB8IkVCgICA4A+DfadqNgI4IAMgCyATrELCtgd+IkwgQUIaiHwgTEKAgIAIfCJBQoCAgPAPg32najYCVCADIBcgQ0IaiCBAfCBCQoCAgPAPg32najYCTCADIAYgREIaiCBGfCBHQoCAgPAPg32najYCRCADIAcgRUIaiCBIfCBJQoCAgPAPg32najYCPCADIAkgSiBLQoCAgPAPg30gQUIZh0ITfiAVrELCtgd+fCJAQoCAgBB8IkJCGoh8p2o2AjQgAyANIEAgQkKAgIDgD4N9p2o2AjAgAUEBayECIBogA0GgAmogBBAGIAQgAyAMEAYgAQ0ACyADKAKQASEXIAMoAvABIQIgAygClAEhDiADKAL0ASEMIAMoApgBIQ8gAygC+AEhBiADKAKcASEQIAMoAvwBIQogAygCoAEhFCADKAKAAiEHIAMoAqQBIREgAygChAIhCCADKAKoASESIAMoAogCIQkgAygCrAEhEyADKAKMAiELIAMoArABIRUgAygCkAIhDSADQQAgFmsiASADKAKUAiIWIAMoArQBc3EgFnM2ApQCIAMgDSANIBVzIAFxczYCkAIgAyALIAsgE3MgAXFzNgKMAiADIAkgCSAScyABcXM2AogCIAMgCCAIIBFzIAFxczYChAIgAyAHIAcgFHMgAXFzNgKAAiADIAogCiAQcyABcXM2AvwBIAMgBiAGIA9zIAFxczYC+AEgAyAMIAwgDnMgAXFzNgL0ASADIAIgAiAXcyABcXM2AvABIAMoAsABIQIgAygCYCENIAMoAsQBIRYgAygCZCEXIAMoAsgBIQwgAygCaCEOIAMoAswBIQYgAygCbCEPIAMoAtABIQogAygCcCEQIAMoAtQBIQcgAygCdCEUIAMoAtgBIQggAygCeCERIAMoAtwBIQkgAygCfCESIAMoAuABIQsgAygCgAEhEyADIAMoAuQBIhUgAygChAFzIAFxIBVzNgLkASADIAsgCyATcyABcXM2AuABIAMgCSAJIBJzIAFxczYC3AEgAyAIIAggEXMgAXFzNgLYASADIAcgByAUcyABcXM2AtQBIAMgCiAKIBBzIAFxczYC0AEgAyAGIAYgD3MgAXFzNgLMASADIAwgDCAOcyABcXM2AsgB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JyAFLQADczoAJyAAIAAtACggBS0ABHM6ACggACAALQApIAUtAAVzOgApIAAgAC0AKiAFLQAGczoAKiAAIAAtACsgBS0AB3M6ACsgCRBxAkAgB0ECcUUEQCAJQQQQKEUNAQsgBSAAKQAYNwP4AiAFIAApABA3A/ACIAUgACkACDcD6AIgBSAAKQAANwPgAiAFIAApACQ3A4ADIAVB4AJqIgEgAUIoIAlBACAAQfS5AigCABEOABogACAFKQP4AjcAGCAAIAUpA/ACNwAQIAAgBSkD6AI3AAggACAFKQPgAjcAACAFKQOAAyEKIABBATYAICAAIAo3ACQLIAIEQCACIAs3AwALQQAhDSADRQ0AIAMgBzoAAAsgBUGQA2okACANDAELEAoACwvhBQECfgJ/IAStIAWtQiCGhCEKIAetIAitQiCGhCELIwBBgANrIgQkACACBEAgAkIANwMACyAKQu////8PVARAIARBEGoiCELAACAAQSBqIgcgABAmIARB0ABqIgUgCEG8uQIoAgARAQAaIAhBwAAQByAFIAYgC0HAuQIoAgARAAAaIAVB0LMCQgAgC31CD4NBwLkCKAIAEQAAGiAEQgA3AxAgBEIANwNIIARCADcDQCAEQgA3AzggBEIANwMwIARCADcDKCAEQgA3AyAgBEIANwMYIAQgCToAECAIIAhCwAAgB0EBIAAQJyAFIAhCwABBwLkCKAIAEQAAGiABIAQtABA6AAAgAUEBaiIBIAMgCiAHQQIgABAnIAUgASAKQcC5AigCABEAABogBUHQswIgCkIPg0HAuQIoAgARAAAaIAQgCzcDCCAFIARBCGoiA0IIQcC5AigCABEAABogBCAKQkB9NwMIIAUgA0IIQcC5AigCABEAABogBSABIAqnaiIBQcS5AigCABEBABogBUGAAhAHIAAgAC0AJCABLQAAczoAJCAAIAAtACUgAS0AAXM6ACUgACAALQAmIAEtAAJzOgAmIAAgAC0AJyABLQADczoAJyAAIAAtACggAS0ABHM6ACggACAALQApIAEtAAVzOgApIAAgAC0AKiABLQAGczoAKiAAIAAtACsgAS0AB3M6ACsgBxBxAkAgCUECcUUEQCAHQQQQKEUNAQsgBCAAKQAYNwPoAiAEIAApABA3A+ACIAQgACkACDcD2AIgBCAAKQAANwPQAiAEIAAp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C6dqQRBrIAYgDCAJIAoQgwEhAgsgAQRAIAFCACALQhB9IAIbNwMACyACCyUAIAAgAiADrSAErUIghoQgBSAGIAetIAitQiCGhCAJIAoQgwELWQECfgJ/IAatIAetQiCGhCEMIAOtIAStQiCGhCILQvD///8PVARAIAAgACALp2pBACACIAsgBSAMIAkgChCEARogAQRAIAEgC0IQfDcDAAtBAAwBCxAKAAsLJwAgACABIAIgAyAErSAFrUIghoQgBiAHrSAIrUIghoQgCiALEIQBC1kBAn4CfyAGrSAHrUIghoQhDCADrSAErUIghoQiC0Lw////D1QEQCAAIAAgC6dqQQAgAiALIAUgDCAJIAoQhQEaIAEEQCABIAtCEHw3AwALQQAMAQsQCgALCycAIAAgASACIAMgBK0gBa1CIIaEIAYgB60gCK1CIIaEIAogCxCFAQtZAQJ+IAetIAitQiCGhCELQX8hAQJAIAOtIAStQiCGhCIMQt////8PVg0AIAtC3////w9WDQAgACACIAynIAVBICAGIAunIAkgCkHkuQIoAgARCgAhAQsgAQuAAQEDfiAHrSAIrUIghoQhDEF/IQICQCAErSAFrUIghoQiC0IgVA0AIAtCIH0iDULf////D1YNACAMQt////8PVg0AIAAgAyANpyADIAunakEga0EgIAYgDKcgCSAKQeS5AigCABEKACECCyABBEAgAUIAIAtCIH0gAhs3AwALIAILYAECfiAErSAFrUIghoQhDCAHrSAIrUIghoQhDSACBEAgAkIgNwMACyANQuD///8PVCAMQt////8PWHFFBEAQCgALIAAgAUEgIAMgDKcgBiANpyAKIAtB4LkCKAIAEQoAC3YBAn4CfyAGrSAHrUIghoQhCwJAIAOtIAStQiCGhCIMQuD///8PWg0AIAtC4P///w9aDQAgACAAIAynIgNqQSAgAiADIAUgC6cgCSAKQeC5AigCABEKACEAIAEEQCABQgAgDEIgfCAAGzcDAAsgAAwBCxAKAAsLWQECfiAHrSAIrUIghoQhC0F/IQECQCADrSAErUIghoQiDELf////D1YNACALQt////8PVg0AIAAgAiAMpyAFQSAgBiALpyAJIApB3LkCKAIAEQoAIQELIAELgAEBA34gB60gCK1CIIaEIQxBfyECAkAgBK0gBa1CIIaE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//8HSw0AIAEgA0EBdE0NAEEAIQEgAwR/A0AgACABQQF0aiIEIAEgAmotAAAiBUEPcSIGQQh0IAZB9v8DakGAsgNxakGArgFqQQh2OgABIAQgBUEEdiIEIARB9v8DakEIdkHZAXFqQdcAajoAACABQQFqIgEgA0cNAAsgA0EBdAVBAAsgAGpBADoAACAADwsQCgALCgAgACABIAIQMQsIACAAIAEQWwtaAQF/IwBBQGoiAyQAIAMgAkIgEC8aIAEgAykDGDcAGCABIAMpAxA3ABAgASADKQMINwAIIAEgAykDADcAACADQcAAEAcgACABQcy5AigCABEBACADQUBrJAALCwAgACABIAIQgQELCwAgACABIAIQigELCwAgACABIAIQiwELCQAgACABEI0BCwsAIAAgASACEI4BCwUAQcMICwQAQQwLJwEBfyMAQUBqIgMkACAAIAMQHCABIANCwAAgAkEBEF0gA0FAayQACykBAX8jAEFAaiIEJAAgACAEEBwgASACIARCwAAgA0EBEF4gBEFAayQACwgAIAAQJUEAC7sBAgJ/A34jAEHAAWsiAiQAIAJBIBAVIAEgAkIgEC8aIAEgAS0AAEH4AXE6AAAgASABLQAfQT9xQcAAcjoAHyACQSBqIgMgARBCIAAgAxBDIAEgAikDGDcAGCABIAIpAxA3ABAgASACKQMINwAIIAEgAikDADcAACAAKQAAIQQgACkACCEFIAApABAhBiABIAApABg3ADggASAGNwAwIAEgBTcAKCABIAQ3ACAgAkEgEAcgAkHAAWokAEEAC7YBAgF/A34jAEGgAWsiAyQAIAEgAkIgEC8aIAEgAS0AAEH4AXE6AAAgASABLQAfQT9xQcAAcjoAHyADIAEQQiAAIAMQQyACKQAAIQQgAikACCEFIAIpABAhBiABIAIpABg3ABggASAGNwAQIAEgBTcACCABIAQ3AAAgACkAACEEIAApAAghBSAAKQAQIQYgASAAKQAYNwA4IAEgBjcAMCABIAU3ACggASAENwAgIANBoAFqJABBAAsFAEG/fwsKACAAIAEQYEEAC20BAX8jAEFAaiICJAAgAiABQiAQLxogAiACLQAAQfgBcToAACACIAItAB9BP3FBwAByOgAfIAAgAikDEDcAECAAIAIpAwg3AAggACACKQMANwAAIAAgAikDGDcAGCACQcAAEAcgAkFAayQAQQALohYCFX8ofiMAQYACayIDJABBfyETAkAgARBYDQAgA0HgAGoiBCABEHkNACMAQYAQayICJAAgAkGABWoiASAEEBIgAiAEKQIgNwPgAiACIAQpAhg3A9gCIAIgBCkCEDcD0AIgAiAEKQIINwPIAiACIAQpAgA3A8ACIAIgBCkCKDcD6AIgAiAEKQIwNwPwAiACIAQpAjg3A/gCIAIgBEFAaykCADcDgAMgAiAEKQJINwOIAyACIAQpAlA3A5ADIAIgBCkCWDcDmAMgAiAEKQJgNwOgAyACIAQpAmg3A6gDIAIgBCkCcDcDsAMgAkHgA2oiBSACQcACaiIJECIgAkGgAWoiBCAFIAJB2ARqIgYQBiACQcgBaiACQYgEaiIHIAJBsARqIggQBiACQfABaiAIIAYQBiACQZgCaiAFIAcQBiAFIAQgARATIAkgBSAGEAYgAkHoAmoiCiAHIAgQBiACQZADaiILIAggBhAGIAJBuANqIgwgBSAHEAYgAkGgBmoiASAJEBIgBSAEIAEQEyAJIAUgBhAGIAogByAIEAYgCyAIIAYQBiAMIAUgBxAGIAJBwAdqIgEgCRASIAUgBCABEBMgCSAFIAYQBiAKIAcgCBAGIAsgCCAGEAYgDCAFIAcQBiACQeAIaiIBIAkQEiAFIAQgARATIAkgBSAGEAYgCiAHIAgQBiALIAggBhAGIAwgBSAHEAYgAkGACmoiASAJEBIgBSAEIAEQEyAJIAUgBhAGIAogByAIEAYgCyAIIAYQBiAMIAUgBxAGIAJBoAtqIgEgCRASIAUgBCABEBMgCSAFIAYQBiAKIAcgCBAGIAsgCCAGEAYgDCAFIAcQBiACQcAMaiIBIAkQEiAFIAQgARATIAkgBSAGEAYgCiAHIAgQBiALIAggBhAGIAwgBSAHEAYgAkHgDWogCRASIAJCADcDICACQgA3AxggAkIANwMQIAJCADcDCCACQgA3AwAgAkIANwIsIAJBATYCKCACQgA3AjQgAkIANwI8IAJCADcCRCACQoCAgIAQNwJMIAJB1ABqQQBBzAD8CwAgAkH4AGohCSACQdgPaiEPIAJBsA9qIRAgAkHQAGohDSACQShqIQ5B/AEhBANAIAIgAikDIDcDqA8gAiACKQMYNwOgDyACIAIpAxA3A5gPIAIgAikDCDcDkA8gAiACKQMANwOIDyAQIA4pAiA3AiAgECAOKQIYNwIYIBAgDikCEDcCECAQIA4pAgg3AgggECAOKQIANwIAIA8gDSkCIDcCICAPIA0pAhg3AhggDyANKQIQNwIQIA8gDSkCCDcCCCAPIA0pAgA3AgAgBCIBQZCFAmosAAAhESACQeADaiIFIAJBiA9qECICQCARQQBKBEAgAkHAAmoiBCAFIAYQBiAKIAcgCBAGIAsgCCAGEAYgDCAFIAcQBiAFIAQgAkGABWogEUH+AXFBAXZBoAFsahATDAELIBFBAE4NACACQcACaiIEIAJB4ANqIgUgBhAGIAogByAIEAYgCyAIIAYQBiAMIAUgBxAGIAUgBCACQYAFakEAIBFrQf4BcUEBdkGgAWxqEHcLIAIgAkHgA2oiEiAGEAYgDiAHIAgQBiANIAggBhAGIAkgEiAHEAYgAUEBayEEIAENAAsgAigCKCEUIAIoAlAhFSACKAIsIRYgAigCVCEGIAIoAjAhByACKAJYIQggAigCNCEKIAIoAlwhCyACKAI4IQwgAigCYCENIAIoAjwhDiACKAJkIQ8gAigCQCEQIAIoAmghESACKAJEIQUgAigCbCEJIAIoAkghBCACKAJwIQEgAiACKAJMIAIoAnRrNgKkBSACIAQgAWs2AqAFIAIgBSAJazYCnAUgAiAQIBFrNgKYBSACIA4gD2s2ApQFIAIgDCANazYCkAUgAiAKIAtrNgKMBSACIAcgCGs2AogFIAIgFiAGazYChAUgAiAUIBVrNgKABSASIAIQGiASQSAQKCEEIBIgAkGABWoQGiASQSAQKCACQYAQaiQAIARxRQ0AQQAhEyADQQAgAygCrAEiBms2AiQgA0EAIAMoAqgBIgxrNgIgIANBACADKAKkASIHazYCHCADQQAgAygCoAEiBWs2AhggA0EAIAMoApwBIghrNgIUIANBACADKAKYASIJazYCECADQQAgAygClAEiCms2AgwgA0EAIAMoApABIgRrNgIIIANBACADKAKMASILazYCBCADQQEgAygCiAEiAWs2AgAgAyADEEQgAyADKAIEIg2sIh8gCEEBdKwiKX4gAzQCACIZIAWsIhp+fCADKAIIIg6sIiEgCawiG358IAMoAgwiD6wiIyAKQQF0rCIqfnwgAygCECIQrCIlIASsIhx+fCADKAIUIhGsIisgC0EBdKwiLH58IAMoAhgiBawiNSABQQFqrCIdfnwgAygCHCIJQRNsrCIkIAZBAXSsIi1+fCADKAIgIgRBE2ysIiIgDKwiHn58IAMoAiQiAUETbKwiICAHQQF0rCIufnwgGyAffiAZIAisIi9+fCAhIAqsIjB+fCAcICN+fCAlIAusIjF+fCAdICt+fCAFQRNsrCImIAasIjJ+fCAeICR+fCAiIAesIjN+fCAaICB+fCAfICp+IBkgG358IBwgIX58ICMgLH58IB0gJX58IBFBE2ysIjQgLX58IB4gJn58ICQgLn58IBogIn58ICAgKX58IjdCgICAEHwiOEIah3wiOUKAgIAIfCI6QhmHfCIXIBdCgICAEHwiJ0KAgIDgD4N9PgJIIAMgHyAsfiAZIBx+fCAdICF+fCAPQRNsrCIYIC1+fCAQQRNsrCIoIB5+fCAuIDR+fCAaICZ+fCAkICl+fCAbICJ+fCAgICp+fCAdIB9+IBkgMX58IA5BE2ysIhcgMn58IBggHn58ICggM358IBogNH58ICYgL358IBsgJH58ICIgMH58IBwgIH58IA1BE2ysIC1+IBkgHX58IBcgHn58IBggLn58IBogKH58ICkgNH58IBsgJn58ICQgKn58IBwgIn58ICAgLH58IjtCgICAEHwiPEIah3wiPUKAgIAIfCI+QhmHfCIXIBdCgICAEHwiGEKAgIDgD4N9PgI4IAMgGiAffiAZIDN+fCAhIC9+fCAbICN+fCAlIDB+fCAcICt+fCAxIDV+fCAJrCI2IB1+fCAiIDJ+fCAeICB+fCAnQhqHfCIXIBdCgICACHwiJ0KAgIDwD4N9PgJMIAMgHCAffiAZIDB+fCAhIDF+fCAdICN+fCAoIDJ+fCAeIDR+fCAmIDN+fCAaICR+fCAiIC9+fCAbICB+fCAYQhqHfCIXIBdCgICACHwiGEKAgIDwD4N9PgI8IAMgHyAufiAZIB5+fCAaICF+fCAjICl+fCAbICV+fCAqICt+fCAcIDV+fCAsIDZ+fCAErCIoIB1+fCAgIC1+fCAnQhmHfCIXIBdCgICAEHwiJ0KAgIDgD4N9PgJQIAMgOSA6QoCAgPAPg30gNyA4QoCAgGCDfSAYQhmHfCIYQoCAgBB8IhdCGoh8PgJEIAMgGCAXQoCAgOAPg30+AkAgAyAeIB9+IBkgMn58ICEgM358IBogI358ICUgL358IBsgK358IDAgNX58IBwgNn58ICggMX58IAGsIB1+fCAnQhqHfCIXIBdCgICACHwiF0KAgIDwD4N9PgJUIAMgPSA+QoCAgPAPg30gOyA8QoCAgGCDfSAXQhmHQhN+fCIYQoCAgBB8IhdCGoh8PgI0IAMgGCAXQoCAgOAPg30+AjAgACADQTBqEBoLIANBgAJqJAAgEwsLACAAIAEgAhCGAQsEAEEECwQAQRoLBQBBrwoLDAAgACABIAIQYkEACxIAIAAgASACQZS6AigCABEEAAsSACAAIAEgAkGQugIoAgARBAALEgAgACABIAJBjLoCKAIAEQQACxQAIAAgASACIANBiLoCKAIAEQsACxIAIAAgASACQYS6AigCABEEAAsUACAAIAEgAiADQYC6AigCABELAAsSACAAIAEgAkH8uQIoAgARBAALtAEBAX8gACABKAAAQf///x9xNgIAIAAgASgAA0ECdkGD/v8fcTYCBCAAIAEoAAZBBHZB/4H/H3E2AgggACABKAAJQQZ2Qf//wB9xNgIMIAEoAAwhAiAAQgA3AhQgAEIANwIcIABBADYCJCAAIAJBCHZB//8/cTYCECAAIAEoABA2AiggACABKAAUNgIsIAAgASgAGDYCMCABKAAcIQEgAEEAOgBQIABCADcDOCAAIAE2AjRBAAvFKAELfyMAQRBrIgokAAJAAkACQAJAAkACQAJAAkACQAJAIABB9AFNBEBB1MACKAIAIgRBECAAQQtqQfgDcSAAQQtJGyIGQQN2IgB2IgFBA3EEQAJAIAFBf3NBAXEgAGoiA0EDdCIBQfzAAmoiACABKAKEwQIiAigCCCIFRgRAQdTAAiAEQX4gA3dxNgIADAELIAUgADYCDCAAIAU2AggLIAJBCGohACACIAFBA3I2AgQgASACaiIBIAEoAgRBAXI2AgQMCwsgBkHcwAIoAgAiCE0NASABBEACQEECIAB0IgJBACACa3IgASAAdHFoIgNBA3QiAUH8wAJqIgIgASgChMECIgAoAggiBUYEQEHUwAIgBEF+IAN3cSIENgIADAELIAUgAjYCDCACIAU2AggLIAAgBkEDcjYCBCAAIAZqIgcgASAGayIFQQFyNgIEIAAgAWogBTYCACAIBEAgCEF4cUH8wAJqIQFB6MACKAIAIQIC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QZAIaiEUIANBgAhqIRUgA0GgCGohFkEAIQdBACEIA0AgAyADKAKMByACczYCrAUgAyANQf8BcSATQRh0IhcgD0H/AXFBEHRyIA5B/wFxQQh0cnIiBCADKAKIB3M2AqgFIAMgCkH/AXEgEkEYdCIYIAxB/wFxQRB0ciALQf8BcUEIdHJyIgkgAygChAdzNgKkBSADIBFB/wFxIAZBGHQiGSAIQf8BcUEQdHIgB0H/AXFBCHRyciIQIAMoAoAHczYCoAUgAyADKALcBSACczYCnAUgAyADKALYBSAEczYCmAUgAyADKALUBSAJczYClAUgAyADKALQBSAQczYCkAUgAyADKQOoBTcD+AQgAyADKQOgBTcD8AQgAyADKQKYBzcD6AQgAyADKQKQBzcD4AQgA0GABWoiBCADQfAEaiADQeAEahAFIAMgAykCiAU3A6gFIAMgAykCgAU3A6AFIAMgAykDkAU3A9AEIAMgAykDmAU3A9gEIAMgAykC4AU3A8AEIAMgAykC6AU3A8gEIAQgA0HQBGogA0HABGoQBSADIAMpAogFNwOYBSADIAMpAoAFNwOQBSADIAMpA6AFNwOwBCADIAMpA6gFNwO4BCADIAMpAqAHNwOgBCADIAMpAqgHNwOoBCAEIANBsARqIANBoARqEAUgAyADKQKIBTcDqAUgAyADKQKABTcDoAUgAyADKQOQBTcDkAQgAyADKQOYBTcDmAQgAyADKQLwBTcDgAQgAyADKQL4BTcDiAQgBCADQZAEaiADQYAEahAFIAMgAykCiAU3A5gFIAMgAykCgAU3A5AFIAMgAykDoAU3A/ADIAMgAykDqAU3A/gDIAMgAykCsAc3A+ADIAMgAykCuAc3A+gDIAQgA0HwA2ogA0HgA2oQBSADIAMpAogFNwOoBSADIAMpAoAFNwOgBSADIAMpA5AFNwPQAyADIAMpA5gFNwPYAyADIAMpAoAGNwPAAyADIAMpAogGNwPIAyAEIANB0ANqIANBwANqEAUgAyADKQKIBTcDmAUgAyADKQKABTcDkAUgAyADKQOgBTcDsAMgAyADKQOoBTcDuAMgAyADKQLABzcDoAMgAyADKQLIBzcDqAMgBCADQbADaiADQaADahAFIAMgAykCiAU3A6gFIAMgAykCgAU3A6AFIAMgAykDkAU3A5ADIAMgAykDmAU3A5gDIAMgAykCkAY3A4ADIAMgAykCmAY3A4gDIAQgA0GQA2ogA0GAA2oQBSADIAMpAogFNwOYBSADIAMpAoAFNwOQBSADIAMpA6AFNwPwAiADIAMpA6gFNwP4AiADIAMpAtAHNwPgAiADIAMpAtgHNwPoAiAEIANB8AJqIANB4AJqEAUgAyADKQKIBTcDqAUgAyADKQKABTcDoAUgAyADKQOQBTcD0AIgAyADKQOYBTcD2AIgAyADKQKgBjcDwAIgAyADKQKoBjcDyAIgBCADQdACaiADQcACahAFIAMgAykCiAU3A5gFIAMgAykCgAU3A5AFIAMgAykDoAU3A7ACIAMgAykDqAU3A7gCIAMgAykC4Ac3A6ACIAMgAykC6Ac3A6gCIAQgA0GwAmogA0GgAmoQBSADIAMpAogFNwOoBSADIAMpAoAFNwOgBSADIAMpA5AFNwOQAiADIAMpA5gFNwOYAiADIAMpArAGNwOAAiADIAMpArgGNwOIAiAEIANBkAJqIANBgAJqEAUgAyADKQKIBTcDmAUgAyADKQKABTcDkAUgAyADKQOgBTcD8AEgAyADKQOoBTcD+AEgAyADKQLwBzcD4AEgAyADKQL4BzcD6AEgBCADQfABaiADQeABahAFIAMgAykCiAU3A6gFIAMgAykCgAU3A6AFIAMgAykDkAU3A9ABIAMgAykDmAU3A9gBIAMgAykCwAY3A8ABIAMgAykCyAY3A8gBIAQgA0HQAWogA0HAAWoQBSADIAMpAogFNwOYBSADIAMpAoAFNwOQBSADIAMpA6AFNwOwASADIAMpA6gFNwO4ASADIBUpAgA3A6ABIAMgFSkCCDcDqAEgBCADQbABaiADQaABahAFIAMgAykCiAU3A6gFIAMgAykCgAU3A6AFIAMgAykDkAU3A5ABIAMgAykDmAU3A5gBIAMgAykC0AY3A4ABIAMgAykC2AY3A4gBIAQgA0GQAWogA0GAAWoQBSADIAMpAogFNwOYBSADIAMpAoAFNwOQBSADIAMpA6AFNwNwIAMgAykDqAU3A3ggAyAUKQIANwNgIAMgFCkCCDcDaCAEIANB8ABqIANB4ABqEAUgAyADKQKIBTcDqAUgAyADKQKABTcDoAUgAyADKQOQBTcDUCADIAMpA5gFNwNYIAMgAykC4AY3A0AgAyADKQLoBjcDSCAEIANB0ABq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BzcD6AMgBCADQfADaiADQeADahAFIAMgAykCiAU3A6gFIAMgAykCgAU3A6AFIAMgAykDkAU3A9ADIAMgAykDmAU3A9gDIAMgAykCgAY3A8ADIAMgAykCiAY3A8gDIAQgA0HQA2ogA0HAA2oQBSADIAMpAogFNwOYBSADIAMpAoAFNwOQBSADIAMpA6AFNwOwAyADIAMpA6gFNwO4AyADIAMpAsAHNwOgAyADIAMpAsgHNwOoAyAEIANBsANqIANBoANqEAUgAyADKQKIBTcDqAUgAyADKQKABTcDoAUgAyADKQOQBTcDkAMgAyADKQOYBTcDmAMgAyADKQKQBjcDgAMgAyADKQKYBjcDiAMgBCADQZADaiADQYADahAFIAMgAykCiAU3A5gFIAMgAykCgAU3A5AFIAMgAykDoAU3A/ACIAMgAykDqAU3A/gCIAMgAykC0Ac3A+ACIAMgAykC2Ac3A+gCIAQgA0HwAmogA0HgAmoQBSADIAMpAogFNwOoBSADIAMpAoAFNwOgBSADIAMpA5AFNwPQAiADIAMpA5gFNwPYAiADIAMpAqAGNwPAAiADIAMpAqgGNwPIAiAEIANB0AJqIANBwAJqEAUgAyADKQKIBTcDmAUgAyADKQKABTcDkAUgAyADKQOgBTcDsAIgAyADKQOoBTcDuAIgAyADKQLgBzcDoAIgAyADKQLoBzcDqAIgBCADQbACaiADQaACahAFIAMgAykCiAU3A6gFIAMgAykCgAU3A6AFIAMgAykDkAU3A5ACIAMgAykDmAU3A5gCIAMgAykCsAY3A4ACIAMgAykCuAY3A4gCIAQgA0GQAmogA0GAAmoQBSADIAMpAogFNwOYBSADIAMpAoAFNwOQBSADIAMpA6AFNwPwASADIAMpA6gFNwP4ASADIAMpAvAHNwPgASADIAMpAvgHNwPoASAEIANB8AFqIANB4AFqEAUgAyADKQKIBTcDqAUgAyADKQKABTcDoAUgAyADKQOQBTcD0AEgAyADKQOYBTcD2AEgAyADKQLABjcDwAEgAyADKQLIBjcDyAEgBCADQdABaiADQcABahAFIAMgAykCiAU3A5gFIAMgAykCgAU3A5AFIAMgAykDoAU3A7ABIAMgAykDqAU3A7gBIAMgFSkCADcDoAEgAyAVKQIINwOoASAEIANBsAFqIANBoAFqEAUg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AiAEIAMtAAdB2gBzOgDHAiAEIAMtAAhB2gBzOgDIAiAEIAMtAAlB2gBzOgDJAiAEIAMtAApB2gBzOgDKAiAEIAMtAAtB2gBzOgDLAiAEIAMtAAxB2gBzOgDMAiAEIAMtAA1B2gBzOgDNAiAEIAMtAA5B2gBzOgDOAiAEIAMtAA9B2gBzOgDPAiAJIARBwAJqEBELIAAgAikACDcACCAAIAIpAAA3AAAgBEHgBWogAiAEQYAEahCJASABKAAIIQIgASgADCEDIAEoAAAhBSAEIAQoAuQFIgYgASgABCAEKALUAnNzNgLUBSAEIAQoAuAFIgEgBSAEKALQAnNzNgLQBSAEIAQoAuwFIgUgAyAEKALcAnNzNgLcBSAEIAQoAugFIgMgAiAEKALYAnNzNgLYBSAEIAQpA9AFNwOwAiAEIAQpA9gFNwO4AiAEIAQpA+gCNwOoAiAEIAQpA+ACNwOgAiAEQcAFaiICIARBsAJqIARBoAJqEAUgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAQgCzcDkAIgBCAKNwOYAiAEIAQpA/ACNwOAAiAEIAQpA/gCNwOIAiACIARBkAJqIARBgAJqEAUgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAQgCzcD8AEgBCAKNwP4ASAEIAQpA4ADNwPgASAEIAQpA4gDNwPoASACIARB8AFqIARB4AFqEAUgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAQgCzcD0AEgBCAKNwPYASAEIAQpA5ADNwPAASAEIAQpA5gDNwPIASACIARB0AFqIARBwAFqEAUgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAQgCzcDsAEgBCAKNwO4ASAEIAQpAqADNwOgASAEIAQpAqgDNwOoASACIARBsAFqIARBoAFqEAUgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAQgCzcDkAEgBCAKNwOYASAEIAQpA7ADNwOAASAEIAQpA7gDNwOIASACIARBkAFqIARBgAFqEAUgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAQgCzcDcCAEIAo3A3ggBCAEKQPAAzcDYCAEIAQpA8gDNwNoIAIgBEHwAGogBEHgAGoQBSAEIAQpAsgFIgo3A9gFIAQgBCkCwAUiCzcD0AUgBCALNwNQIAQgCjcDWCAEIAQpA9ADNwNAIAQgBCkD2AM3A0ggAiAEQdAAaiAEQUBrEAUgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAQgCzcDMCAEIAo3AzggBCAEKQPgAzcDICAEIAQpA+gDNwMoIAIgBEEwaiAEQSBqEAUgBCAFIAQoAvwDczYCvAUgBCADIAQoAvgDczYCuAUgBCAGIAQoAvQDczYCtAUgBCABIAQoAvADczYCsAUgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAQgCzcDECAEIAo3AxggBCAEKQK4BTcDCCAEIAQpArAFNwMAIAIgBEEQaiAEECEgBCAEKQLIBSIKNwPYBSAEIAQpAsAFIgs3A9AFIAAgCjcAGCAAIAs3ABAgBEHwBWokAAvZDgIHfwJ+IwBBkAZrIgMkACADQdACaiIEIAIQESADIAEvAAAiAjYC0AQgAyABLwACIgY2AtQEIAMgAS8ABCIHNgLYBCADIAEvAAYiCDYC3AQgAyADKQLQBDcDwAIgAyADKQLYBDcDyAIgAyADKALAAhAINgLABCADIAMoAsQCEAg2AsQEIAMgAygCyAIQCDYCyAQgAyADKALMAhAINgLMBCADQeAEaiIFIARBsAH8CgAAIAUQViABKAAQIQQgASgAFCEFIAEoAAghCSADIAYgASgADCADKAKEBnNzNgK0BCADIAIgCSADKAKABnNzNgKwBCADIAggBSADKAKMBnNzNgK8BCADIAcgBCADKAKIBnNzNgK4BCADIAMoAsQEIAMoAvQFczYClAQgAyADKALABCADKALwBXM2ApAEIAMoAvgFIQEgAygCyAQhBCADIAMoAswEIAMoAvwFczYCnAQgAyABIARzNgKYBCADIAMpA7gENwO4AiADIAMpA7AENwOwAiADIAMpApgENwOoAiADIAMpApAENwOgAiADQaAEaiIBIANBsAJqIANBoAJqEAsgAyADKQKoBCIKNwO4BCADIAMpAqAEIgs3A7AEIAMgAygCxAQgAygC5AVzNgKUBCADIAMoAsAEIAMoAuAFczYCkAQgAyADKALMBCADKALsBXM2ApwEIAMgAygCyAQgAygC6AVzNgKYBCADIAo3A5gCIAMgCzcDkAIgAyADKQKYBDcDiAIgAyADKQKQBDcDgAIgASADQZACaiADQYACahALIAMgAykCqAQiCjcDuAQgAyADKQKgBCILNwOwBCADIAMoAsQEIAMoAtQFczYClAQgAyADKALABCADKALQBXM2ApAEIAMgAygCzAQgAygC3AVzNgKcBCADIAMoAsgEIAMoAtgFczYCmAQgAyAKNwP4ASADIAs3A/ABIAMgAykCmAQ3A+gBIAMgAykCkAQ3A+ABIAEgA0HwAWogA0HgAWoQCyADIAMpAqgEIgo3A7gEIAMgAykCoAQiCzcDsAQgAyADKALEBCADKALEBXM2ApQEIAMgAygCwAQgAygCwAVzNgKQBCADIAMoAswEIAMoAswFczYCnAQgAyADKALIBCADKALIBXM2ApgEIAMgCjcD2AEgAyALNwPQASADIAMpApgENwPIASADIAMpApAENwPAASABIANB0AFqIANBwAFqEAsgAyADKQKoBCIKNwO4BCADIAMpAqAEIgs3A7AEIAMgAygCxAQgAygCtAVzNgKUBCADIAMoAsAEIAMoArAFczYCkAQgAyADKALMBCADKAK8BXM2ApwEIAMgAygCyAQgAygCuAVzNgKYBCADIAo3A7gBIAMgCzcDsAEgAyADKQKYBDcDqAEgAyADKQKQBDcDoAEgASADQbABaiADQaABahALIAMgAykCqAQiCjcDuAQgAyADKQKgBCILNwOwBCADIAMoAsQEIAMoAqQFczYClAQgAyADKALABCADKAKgBXM2ApAEIAMgAygCzAQgAygCrAVzNgKcBCADIAMoAsgEIAMoAqgFczYCmAQgAyAKNwOYASADIAs3A5ABIAMgAykCmAQ3A4gBIAMgAykCkAQ3A4ABIAEgA0GQAWogA0GAAWoQCyADIAMpAqgEIgo3A7gEIAMgAykCoAQiCzcDsAQgAyADKALEBCADKAKUBXM2ApQEIAMgAygCwAQgAygCkAVzNgKQBCADIAMoAswEIAMoApwFczYCnAQgAyADKALIBCADKAKYBXM2ApgEIAMgCjcDeCADIAs3A3AgAyADKQKYBDcDaCADIAMpApAENwNgIAEgA0HwAGogA0HgAGoQCyADIAMpAqgEIgo3A7gEIAMgAykCoAQiCzcDsAQgAyADKALEBCADKAKEBXM2ApQEIAMgAygCwAQgAygCgAVzNgKQBCADIAMoAswEIAMoAowFczYCnAQgAyADKALIBCADKAKIBXM2ApgEIAMgCjcDWCADIAs3A1AgAyADKQKYBDcDSCADIAMpApAENwNAIAEgA0HQAGogA0FAaxALIAMgAykCqAQiCjcDuAQgAyADKQKgBCILNwOwBCADIAMoAsQEIAMoAvQEczYClAQgAyADKALABCADKALwBHM2ApAEIAMgAygCzAQgAygC/ARzNgKcBCADIAMoAsgEIAMoAvgEczYCmAQgAyAKNwM4IAMgCzcDMCADIAMpApgENwMoIAMgAykCkAQ3AyAgASADQTBqIANBIGoQCyADIAggAygC7ARzNgKMBCADIAcgAygC6ARzNgKIBCADIAYgAygC5ARzNgKEBCADIAIgAygC4ARzNgKABCADIAMpAqgEIgo3A7gEIAMgAykCoAQiCzcDsAQgAyALNwMQIAMgCjcDGCADIAMpAogENwMIIAMgAykCgAQ3AwAgASADQRBqIAMQVSADIAMpAqgEIgo3A7gEIAMgAykCoAQiCzcDsAQgACAKNwAIIAAgCzcAACADQZAGaiQAC8oMAgZ/An4jAEGwBGsiBCQAIARBwAJqIAMQESAAIAIpAAA3AAAgAi8ABCEDIAIvAAYhBSACLwAAIQYgASgACCEHIAEoAAwhCCABKAAAIQkgBCACLwACIgIgASgABCAEKALEAnNzNgKkBCAEIAYgCSAEKALAAnNzNgKgBCAEIAUgCCAEKALMAnNzNgKsBCAEIAMgByAEKALIAnNzNgKoBCAEIAIgBCgC1AJzNgKEBCAEIAYgBCgC0AJzNgKABCAEIAUgBCgC3AJzNgKMBCAEIAMgBCgC2AJzNgKIBCAEIAQpA6gENwO4AiAEIAQpA6AENwOwAiAEIAQpAogENwOoAiAEIAQpAoAENwOgAiAEQZAEaiIBIARBsAJqIARBoAJqEAUgBCAFIAQoAuwCczYCjAQgBCADIAQoAugCczYCiAQgBCACIAQoAuQCczYChAQgBCAGIAQoAuACczYCgAQgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAQgCzcDkAIgBCAKNwOYAiAEIAQpAogENwOIAiAEIAQpAoAENwOAAiABIARBkAJqIARBgAJqEAUgBCAFIAQoAvwCczYCjAQgBCADIAQoAvgCczYCiAQgBCACIAQoAvQCczYChAQgBCAGIAQoAvACczYCgAQgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAQgCzcD8AEgBCAKNwP4ASAEIAQpAogENwPoASAEIAQpAoAENwPgASABIARB8AFqIARB4AFqEAUgBCAFIAQoAowDczYCjAQgBCADIAQoAogDczYCiAQgBCACIAQoAoQDczYChAQgBCAGIAQoAoADczYCgAQgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAQgCzcD0AEgBCAKNwPYASAEIAQpAogENwPIASAEIAQpAoAENwPAASABIARB0AFqIARBwAFqEAUgBCAFIAQoApwDczYCjAQgBCADIAQoApgDczYCiAQgBCACIAQoApQDczYChAQgBCAGIAQoApADczYCgAQgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAQgCzcDsAEgBCAKNwO4ASAEIAQpAogENwOoASAEIAQpAoAENwOgASABIARBsAFqIARBoAFqEAUgBCAFIAQoAqwDczYCjAQgBCADIAQoAqgDczYCiAQgBCACIAQoAqQDczYChAQgBCAGIAQoAqADczYCgAQgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAQgCzcDkAEgBCAKNwOYASAEIAQpAogENwOIASAEIAQpAoAENwOAASABIARBkAFqIARBgAFqEAUgBCAFIAQoArwDczYCjAQgBCADIAQoArgDczYCiAQgBCACIAQoArQDczYChAQgBCAGIAQoArADczYCgAQgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAQgCzcDcCAEIAo3A3ggBCAEKQKIBDcDaCAEIAQpAoAENwNgIAEgBEHwAGogBEHgAGoQBSAEIAUgBCgCzANzNgKMBCAEIAMgBCgCyANzNgKIBCAEIAIgBCgCxANzNgKEBCAEIAYgBCgCwANzNgKABCAEIAQpApgEIgo3A6gEIAQgBCkCkAQiCzcDoAQgBCALNwNQIAQgCjcDWCAEIAQpAogENwNIIAQgBCkCgAQ3A0AgASAEQdAAaiAEQUBrEAUgBCAFIAQoAtwDczYCjAQgBCADIAQoAtgDczYCiAQgBCACIAQoAtQDczYChAQgBCAGIAQoAtADczYCgAQgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAQgCzcDMCAEIAo3AzggBCAEKQKIBDcDKCAEIAQpAoAENwMgIAEgBEEwaiAEQSBqEAUgBCAFIAQoAuwDczYC/AMgBCADIAQoAugDczYC+AMgBCACIAQoAuQDczYC9AMgBCAGIAQoAuADczYC8AMgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAQgCzcDECAEIAo3AxggBCAEKQL4AzcDCCAEIAQpAvADNwMAIAEgBEEQaiAEECEgBCAEKQKYBCIKNwOoBCAEIAQpApAEIgs3A6AEIAAgCjcAECAAIAs3AAggBEGwBGokAAvZBwIDfwJ+IwBBwAVrIgMkACADQcACaiIEIAIQESADQZAEaiICIARBsAH8CgAAIAIQViABKAAIIQIgASgADCEEIAEoAAAhBSADIAMoArQFIAEoAARzNgKEBCADIAUgAygCsAVzNgKABCADIAQgAygCvAVzNgKMBCADIAIgAygCuAVzNgKIBCADIAMpA6AFNwOgAiADIAMpA6gFNwOoAiADIAMpA4AENwOwAiADIAMpA4gENwO4AiADQfADaiIBIANBsAJqIANBoAJqEAsgAyADKQL4AyIGNwOIBCADIAMpAvADIgc3A4AEIAMgBzcDkAIgAyAGNwOYAiADIAMpA5AFNwOAAiADIAMpA5gFNwOIAiABIANBkAJqIANBgAJqEAsgAyADKQL4AyIGNwOIBCADIAMpAvADIgc3A4AEIAMgBzcD8AEgAyAGNwP4ASADIAMpA4AFNwPgASADIAMpA4gFNwPoASABIANB8AFqIANB4AFqEAsgAyADKQL4AyIGNwOIBCADIAMpAvADIgc3A4AEIAMgBzcD0AEgAyAGNwPYASADIAMpA/AENwPAASADIAMpA/gENwPIASABIANB0AFqIANBwAFqEAsgAyADKQL4AyIGNwOIBCADIAMpAvADIgc3A4AEIAMgBzcDsAEgAyAGNwO4ASADIAMpA+AENwOgASADIAMpA+gENwOoASABIANBsAFqIANBoAFqEAsgAyADKQL4AyIGNwOIBCADIAMpAvADIgc3A4AEIAMgBzcDkAEgAyAGNwOYASADIAMpA9AENwOAASADIAMpA9gENwOIASABIANBkAFqIANBgAFqEAsgAyADKQL4AyIGNwOIBCADIAMpAvADIgc3A4AEIAMgBzcDcCADIAY3A3ggAyADKQPABDcDYCADIAMpA8gENwNo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AL3irP9xQtb/yj4t/2ZACP9OrhD+hXVE/wBBsBMLAQEAQdATC7ABJuiVj8KyJ7BFw/SJ8u+Y8NXfrAXTxjM5sTgCiG1T/AXHF2pwPU3YT7o8C3YNEGcPKiBT+iw5zMZOx/13kqwDeuz///////////////////////////////////////9/7f///////////////////////////////////////3/u////////////////////////////////////////f+3T9VwaYxJY1pz3ot753hQAQY8VC/zwARCFO4wBvfEk//glwwFg3DcAt0w+/8NCPQAyTKQB4aRM/0w9o/91Ph8AUZFA/3ZBDgCic9b/BoouAHzm9P8Kio8ANBrCALj0TACBjykBvvQT/3uqev9igUQAedWTAFZlHv+hZ5sAjFlD/+/lvgFDC7UAxvCJ/u5FvP/qcTz/Jf85/0Wytv6A0LMAdhp9/gMH1v/xMk3/VcvF/9OH+v8ZMGT/u9W0/hFYaQBT0Z4BBXNiAASuPP6rN27/2bUR/xS8qgCSnGb+V9au/3J6mwHpLKoAfwjvAdbs6gCvBdsAMWo9/wZC0P8Cam7/UeoT/9drwP9Dl+4AEyps/+VVcQEyRIf/EWoJADJnAf9QAagBI5ge/xCouQE4Wej/ZdL8ACn6RwDMqk//Di7v/1BN7wC91kv/EY35ACZQTP++VXUAVuSqAJzY0AHDz6T/lkJM/6/hEP+NUGIBTNvyAMaicgAu2pgAmyvx/pugaP+yCfz+ZG7UAA4FpwDp76P/HJedAWWSCv/+nkb+R/nkAFgeMgBEOqD/vxhoAYFCgf/AMlX/CLOK/yb6yQBzUKAAg+ZxAH1YkwBaRMcA/UyeABz/dgBx+v4AQksuAObaKwDleLoBlEQrAIh87gG7a8X/VDX2/zN0/v8zu6UAAhGvAEJUoAH3Oh4AI0E1/kXsvwAthvUBo3vdACBuFP80F6UAutZHAOmwYADy7zYBOVmKAFMAVP+IoGQAXI54/mh8vgC1sT7/+ilVAJiCKgFg/PYAl5c//u+FPgAgOJwALae9/46FswGDVtMAu7OW/vqqDv9EcRX/3ro7/0IH8QFFBkgAVpxs/jenWQBtNNv+DbAX/8Qsav/vlUf/pIx9/5+tAQAzKecAkT4hAIpvXQG5U0UAkHMuAGGXEP8Y5BoA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zLwm/vVzNP+/cUn+v2xF/xZF9QEXy7IAqmOqAEH4bwAlbJn/QCVFAABYPv5ZlJD/v0TgAfEnNQApy+3/kX7C/90q/f8ZY5cAYf3fAUpzMf8Gr0j/O7DLAHy3+QHk5GMAgQzP/qjAw//MsBD+mOqrAE0lVf8heIf/jsLjAR/WOgDVu33/6C48/750Kv6XshP/Mz7t/szswQDC6DwArCKd/70QuP5nA1//jekk/ikZC/8Vw6YAdvUtAEPVlf+fDBL/u6TjAaAZBQAMTsMBK8XhADCOKf7Emzz/38cSAZGInAD8dan+keLuAO8XawBttbz/5nAx/kmq7f/nt+P/UNwUAMJrfwF/zWUALjTFAdKrJP9YA1r/OJeNAGC7//8qTsgA/kZGAfR9qADMRIoBfNdGAGZCyP4RNOQAddyP/sv4ewA4Eq7/upek/zPo0AGg5Cv/+R0ZAUS+PwANAAAAAP8AAAAA9QAAAAAAAPsAAAAAAAD9AAAAAPMAAAAABwAAAAAAAwAAAADzAAAAAAUAAAAAAAAAAAsAAAAAAAsAAAAA8wAAAAAAAP0AAAAAAP8AAAAAAwAAAAD1AAAAAAAAAA8AAAAAAP8AAAAA/wAAAAAHAAAAAAUAQYyHAgsBAQBBsIcCCwEBAEHQhwILgSvg63p8O0G4rhZW4/rxn8Rq2gmN65wysf2GYgUWX0m4AF+clbyjUIwksdCxVZyD71sERFzEWByOhtgiTt3QnxFX7P///////////////////////////////////////3/t////////////////////////////////////////f+7///////////////////////////////////////9/AAECBAgQIECAGzYAAAAAAMZjY6X4fHyE7nd3mfZ7e43/8vIN1mtrvd5vb7GRxcVUYDAwUAIBAQPOZ2epVisrfef+/hm119diTaur5ux2dpqPyspFH4KCnYnJyUD6fX2H7/r6FbJZWeuOR0fJ+/DwC0Gtreyz1NRnX6Ki/UWvr+ojnJy/U6Sk9+RycpabwMBbdbe3wuH9/Rw9k5OuTCYmamw2Nlp+Pz9B9ff3AoPMzE9oNDRcUaWl9NHl5TT58fEI4nFxk6vY2HNiMTFTKhUVPwgEBAyVx8dSRiMjZZ3Dw14wGBgoN5aWoQoFBQ8vmpq1DgcHCSQSEjYb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"), e((await async function(e, n, r) {
			return async function(e, n) {
				try {
					var r = await async function(e) {
						return function(e) {
							if (ArrayBuffer.isView(e)) return e;
							if (e == l && o) return new Uint8Array(o);
							if (t) return t(e);
							throw "both async and sync fetching of the wasm failed";
						}(e);
					}(e);
					return await WebAssembly.instantiate(r, n);
				} catch (e) {
					_(`failed to asynchronously prepare wasm: ${e}`), x(e);
				}
			}(n, r);
		}(0, l, r)).instance));
	}(), function() {
		function e() {
			n.calledRun = !0, v || (y = !0, s?.(n), n.onRuntimeInitialized?.(), function() {
				if (n.postRun) for (typeof n.postRun == "function" && (n.postRun = [n.postRun]); n.postRun.length;) ne(n.postRun.shift());
				ee(te);
			}());
		}
		(function() {
			if (n.preRun) for (typeof n.preRun == "function" && (n.preRun = [n.preRun]); n.preRun.length;) ie(n.preRun.shift());
			ee(re);
		})(), n.setStatus ? (n.setStatus("Running..."), setTimeout(() => {
			setTimeout(() => n.setStatus(""), 1), e();
		}, 1)) : e();
	}(), y ? n : new Promise((e, t) => {
		s = e, c = t;
	});
}
//#endregion
//#region ../node_modules/libsodium-wrappers/dist/modules-esm/libsodium-wrappers.mjs
var U, W = {};
if (globalThis.crypto === void 0 || typeof globalThis.crypto.getRandomValues != "function") throw Error("globalThis.crypto.getRandomValues is not available. The ESM build of libsodium requires a secure random source (available in all browsers and Node.js 19+).");
var ds = typeof (fs = us) == "function" ? fs : fs != null && typeof fs.default == "function" ? fs.default : null, fs, ps = function(e) {
	return e != null && e.ready !== void 0 ? e : e != null && e.default != null && e.default.ready !== void 0 ? e.default : null;
}(us), ms = (ds == null ? ps == null ? Promise.reject(/* @__PURE__ */ Error("Unsupported libsodium ESM export shape")) : ps.ready.then(function() {
	return ps;
}) : ds({ getRandomValue: function() {
	var e = /* @__PURE__ */ new Uint32Array(1);
	return globalThis.crypto.getRandomValues(e), e[0] >>> 0;
} })).then(function(e) {
	U = e, W.libsodium = U, function() {
		if (U._sodium_init() < 0) throw Error("libsodium was not correctly initialized.");
		for (var e = /* @__PURE__ */ "crypto_aead_aegis128l_decrypt.crypto_aead_aegis128l_decrypt_detached.crypto_aead_aegis128l_encrypt.crypto_aead_aegis128l_encrypt_detached.crypto_aead_aegis128l_keygen.crypto_aead_aegis256_decrypt.crypto_aead_aegis256_decrypt_detached.crypto_aead_aegis256_encrypt.crypto_aead_aegis256_encrypt_detached.crypto_aead_aegis256_keygen.crypto_aead_chacha20poly1305_decrypt.crypto_aead_chacha20poly1305_decrypt_detached.crypto_aead_chacha20poly1305_encrypt.crypto_aead_chacha20poly1305_encrypt_detached.crypto_aead_chacha20poly1305_ietf_decrypt.crypto_aead_chacha20poly1305_ietf_decrypt_detached.crypto_aead_chacha20poly1305_ietf_encrypt.crypto_aead_chacha20poly1305_ietf_encrypt_detached.crypto_aead_chacha20poly1305_ietf_keygen.crypto_aead_chacha20poly1305_keygen.crypto_aead_xchacha20poly1305_ietf_decrypt.crypto_aead_xchacha20poly1305_ietf_decrypt_detached.crypto_aead_xchacha20poly1305_ietf_encrypt.crypto_aead_xchacha20poly1305_ietf_encrypt_detached.crypto_aead_xchacha20poly1305_ietf_keygen.crypto_auth.crypto_auth_hmacsha256.crypto_auth_hmacsha256_final.crypto_auth_hmacsha256_init.crypto_auth_hmacsha256_keygen.crypto_auth_hmacsha256_update.crypto_auth_hmacsha256_verify.crypto_auth_hmacsha512.crypto_auth_hmacsha512256.crypto_auth_hmacsha512256_final.crypto_auth_hmacsha512256_init.crypto_auth_hmacsha512256_keygen.crypto_auth_hmacsha512256_update.crypto_auth_hmacsha512256_verify.crypto_auth_hmacsha512_final.crypto_auth_hmacsha512_init.crypto_auth_hmacsha512_keygen.crypto_auth_hmacsha512_update.crypto_auth_hmacsha512_verify.crypto_auth_keygen.crypto_auth_verify.crypto_box_beforenm.crypto_box_curve25519xchacha20poly1305_beforenm.crypto_box_curve25519xchacha20poly1305_detached.crypto_box_curve25519xchacha20poly1305_detached_afternm.crypto_box_curve25519xchacha20poly1305_easy.crypto_box_curve25519xchacha20poly1305_easy_afternm.crypto_box_curve25519xchacha20poly1305_keypair.crypto_box_curve25519xchacha20poly1305_open_detached.crypto_box_curve25519xchacha20poly1305_open_detached_afternm.crypto_box_curve25519xchacha20poly1305_open_easy.crypto_box_curve25519xchacha20poly1305_open_easy_afternm.crypto_box_curve25519xchacha20poly1305_seal.crypto_box_curve25519xchacha20poly1305_seal_open.crypto_box_curve25519xchacha20poly1305_seed_keypair.crypto_box_detached.crypto_box_easy.crypto_box_easy_afternm.crypto_box_keypair.crypto_box_open_detached.crypto_box_open_easy.crypto_box_open_easy_afternm.crypto_box_seal.crypto_box_seal_open.crypto_box_seed_keypair.crypto_core_ed25519_add.crypto_core_ed25519_from_hash.crypto_core_ed25519_from_uniform.crypto_core_ed25519_is_valid_point.crypto_core_ed25519_random.crypto_core_ed25519_scalar_add.crypto_core_ed25519_scalar_complement.crypto_core_ed25519_scalar_invert.crypto_core_ed25519_scalar_mul.crypto_core_ed25519_scalar_negate.crypto_core_ed25519_scalar_random.crypto_core_ed25519_scalar_reduce.crypto_core_ed25519_scalar_sub.crypto_core_ed25519_sub.crypto_core_hchacha20.crypto_core_hsalsa20.crypto_core_ristretto255_add.crypto_core_ristretto255_from_hash.crypto_core_ristretto255_is_valid_point.crypto_core_ristretto255_random.crypto_core_ristretto255_scalar_add.crypto_core_ristretto255_scalar_complement.crypto_core_ristretto255_scalar_invert.crypto_core_ristretto255_scalar_mul.crypto_core_ristretto255_scalar_negate.crypto_core_ristretto255_scalar_random.crypto_core_ristretto255_scalar_reduce.crypto_core_ristretto255_scalar_sub.crypto_core_ristretto255_sub.crypto_generichash.crypto_generichash_blake2b_salt_personal.crypto_generichash_final.crypto_generichash_init.crypto_generichash_keygen.crypto_generichash_update.crypto_hash.crypto_hash_sha256.crypto_hash_sha256_final.crypto_hash_sha256_init.crypto_hash_sha256_update.crypto_hash_sha3256.crypto_hash_sha3256_final.crypto_hash_sha3256_init.crypto_hash_sha3256_update.crypto_hash_sha3512.crypto_hash_sha3512_final.crypto_hash_sha3512_init.crypto_hash_sha3512_update.crypto_hash_sha512.crypto_hash_sha512_final.crypto_hash_sha512_init.crypto_hash_sha512_update.crypto_ipcrypt_decrypt.crypto_ipcrypt_encrypt.crypto_ipcrypt_keygen.crypto_ipcrypt_nd_decrypt.crypto_ipcrypt_nd_encrypt.crypto_ipcrypt_nd_keygen.crypto_ipcrypt_ndx_decrypt.crypto_ipcrypt_ndx_encrypt.crypto_ipcrypt_ndx_keygen.crypto_ipcrypt_pfx_decrypt.crypto_ipcrypt_pfx_encrypt.crypto_ipcrypt_pfx_keygen.crypto_kdf_derive_from_key.crypto_kdf_keygen.crypto_kem_dec.crypto_kem_enc.crypto_kem_keypair.crypto_kem_mlkem768_dec.crypto_kem_mlkem768_enc.crypto_kem_mlkem768_enc_deterministic.crypto_kem_mlkem768_keypair.crypto_kem_mlkem768_seed_keypair.crypto_kem_primitive.crypto_kem_seed_keypair.crypto_kem_xwing_dec.crypto_kem_xwing_enc.crypto_kem_xwing_enc_deterministic.crypto_kem_xwing_keypair.crypto_kem_xwing_seed_keypair.crypto_kx_client_session_keys.crypto_kx_keypair.crypto_kx_seed_keypair.crypto_kx_server_session_keys.crypto_onetimeauth.crypto_onetimeauth_final.crypto_onetimeauth_init.crypto_onetimeauth_keygen.crypto_onetimeauth_update.crypto_onetimeauth_verify.crypto_pwhash.crypto_pwhash_scryptsalsa208sha256.crypto_pwhash_scryptsalsa208sha256_ll.crypto_pwhash_scryptsalsa208sha256_str.crypto_pwhash_scryptsalsa208sha256_str_verify.crypto_pwhash_str.crypto_pwhash_str_needs_rehash.crypto_pwhash_str_verify.crypto_scalarmult.crypto_scalarmult_base.crypto_scalarmult_ed25519.crypto_scalarmult_ed25519_base.crypto_scalarmult_ed25519_base_noclamp.crypto_scalarmult_ed25519_noclamp.crypto_scalarmult_ristretto255.crypto_scalarmult_ristretto255_base.crypto_secretbox_detached.crypto_secretbox_easy.crypto_secretbox_keygen.crypto_secretbox_open_detached.crypto_secretbox_open_easy.crypto_secretstream_xchacha20poly1305_init_pull.crypto_secretstream_xchacha20poly1305_init_push.crypto_secretstream_xchacha20poly1305_keygen.crypto_secretstream_xchacha20poly1305_pull.crypto_secretstream_xchacha20poly1305_push.crypto_secretstream_xchacha20poly1305_rekey.crypto_shorthash.crypto_shorthash_keygen.crypto_shorthash_siphashx24.crypto_sign.crypto_sign_detached.crypto_sign_ed25519_pk_to_curve25519.crypto_sign_ed25519_sk_to_curve25519.crypto_sign_ed25519_sk_to_pk.crypto_sign_ed25519_sk_to_seed.crypto_sign_final_create.crypto_sign_final_verify.crypto_sign_init.crypto_sign_keypair.crypto_sign_open.crypto_sign_seed_keypair.crypto_sign_update.crypto_sign_verify_detached.crypto_stream_chacha20.crypto_stream_chacha20_ietf_xor.crypto_stream_chacha20_ietf_xor_ic.crypto_stream_chacha20_keygen.crypto_stream_chacha20_xor.crypto_stream_chacha20_xor_ic.crypto_stream_keygen.crypto_stream_xchacha20_keygen.crypto_stream_xchacha20_xor.crypto_stream_xchacha20_xor_ic.crypto_xof_shake128.crypto_xof_shake128_init.crypto_xof_shake128_init_with_domain.crypto_xof_shake128_squeeze.crypto_xof_shake128_update.crypto_xof_shake256.crypto_xof_shake256_init.crypto_xof_shake256_init_with_domain.crypto_xof_shake256_squeeze.crypto_xof_shake256_update.crypto_xof_turboshake128.crypto_xof_turboshake128_init.crypto_xof_turboshake128_init_with_domain.crypto_xof_turboshake128_squeeze.crypto_xof_turboshake128_update.crypto_xof_turboshake256.crypto_xof_turboshake256_init.crypto_xof_turboshake256_init_with_domain.crypto_xof_turboshake256_squeeze.crypto_xof_turboshake256_update.randombytes_buf.randombytes_buf_deterministic.randombytes_close.randombytes_random.randombytes_set_implementation.randombytes_stir.randombytes_uniform.sodium_bin2ip.sodium_ip2bin.sodium_version_string".split("."), t = [
			Is,
			Ls,
			Rs,
			zs,
			Bs,
			Vs,
			Hs,
			Us,
			Ws,
			Gs,
			Ks,
			qs,
			Js,
			Ys,
			Xs,
			Zs,
			Qs,
			$s,
			ec,
			tc,
			nc,
			rc,
			ic,
			ac,
			oc,
			sc,
			cc,
			lc,
			uc,
			dc,
			fc,
			pc,
			mc,
			hc,
			gc,
			_c,
			vc,
			yc,
			bc,
			xc,
			Sc,
			Cc,
			wc,
			Tc,
			Ec,
			Dc,
			Oc,
			kc,
			Ac,
			jc,
			Mc,
			Nc,
			Pc,
			Fc,
			Ic,
			Lc,
			Rc,
			zc,
			Bc,
			Vc,
			Hc,
			Uc,
			Wc,
			Gc,
			Kc,
			qc,
			Jc,
			Yc,
			Xc,
			Zc,
			Qc,
			$c,
			el,
			tl,
			nl,
			rl,
			il,
			al,
			ol,
			sl,
			cl,
			ll,
			ul,
			dl,
			fl,
			pl,
			ml,
			hl,
			gl,
			_l,
			vl,
			yl,
			bl,
			xl,
			Sl,
			Cl,
			wl,
			Tl,
			El,
			Dl,
			Ol,
			kl,
			Al,
			jl,
			Ml,
			Nl,
			Pl,
			Fl,
			Il,
			Ll,
			Rl,
			zl,
			Bl,
			Vl,
			Hl,
			Ul,
			Wl,
			Gl,
			Kl,
			ql,
			Jl,
			Yl,
			Xl,
			Zl,
			Ql,
			$l,
			eu,
			tu,
			nu,
			ru,
			iu,
			au,
			ou,
			su,
			cu,
			lu,
			uu,
			du,
			fu,
			pu,
			mu,
			hu,
			gu,
			_u,
			vu,
			yu,
			bu,
			xu,
			Su,
			Cu,
			wu,
			Tu,
			Eu,
			Du,
			Ou,
			ku,
			Au,
			ju,
			Mu,
			Nu,
			Pu,
			Fu,
			Iu,
			Lu,
			Ru,
			zu,
			Bu,
			Vu,
			Hu,
			Uu,
			Wu,
			Gu,
			Ku,
			qu,
			Ju,
			Yu,
			Xu,
			Zu,
			Qu,
			$u,
			ed,
			td,
			nd,
			rd,
			id,
			ad,
			od,
			sd,
			cd,
			ld,
			ud,
			dd,
			fd,
			pd,
			md,
			hd,
			gd,
			_d,
			vd,
			yd,
			bd,
			xd,
			Sd,
			Cd,
			wd,
			Td,
			Ed,
			Dd,
			Od,
			kd,
			Ad,
			jd,
			Md,
			Nd,
			Pd,
			Fd,
			Id,
			Ld,
			Rd,
			zd,
			Bd,
			Vd,
			Hd,
			Ud,
			Wd,
			Gd,
			Kd,
			qd,
			Jd,
			Yd,
			Xd,
			Zd,
			Qd,
			$d,
			ef,
			tf,
			nf,
			rf,
			af,
			of,
			sf,
			cf,
			lf,
			uf,
			df
		], n = 0; n < t.length; n++) typeof U["_" + e[n]] == "function" && (W[e[n]] = t[n]);
		var r = /* @__PURE__ */ "SODIUM_LIBRARY_VERSION_MAJOR.SODIUM_LIBRARY_VERSION_MINOR.crypto_aead_aegis128l_ABYTES.crypto_aead_aegis128l_KEYBYTES.crypto_aead_aegis128l_MESSAGEBYTES_MAX.crypto_aead_aegis128l_NPUBBYTES.crypto_aead_aegis128l_NSECBYTES.crypto_aead_aegis256_ABYTES.crypto_aead_aegis256_KEYBYTES.crypto_aead_aegis256_MESSAGEBYTES_MAX.crypto_aead_aegis256_NPUBBYTES.crypto_aead_aegis256_NSECBYTES.crypto_aead_aes256gcm_ABYTES.crypto_aead_aes256gcm_KEYBYTES.crypto_aead_aes256gcm_MESSAGEBYTES_MAX.crypto_aead_aes256gcm_NPUBBYTES.crypto_aead_aes256gcm_NSECBYTES.crypto_aead_chacha20poly1305_ABYTES.crypto_aead_chacha20poly1305_IETF_ABYTES.crypto_aead_chacha20poly1305_IETF_KEYBYTES.crypto_aead_chacha20poly1305_IETF_MESSAGEBYTES_MAX.crypto_aead_chacha20poly1305_IETF_NPUBBYTES.crypto_aead_chacha20poly1305_IETF_NSECBYTES.crypto_aead_chacha20poly1305_KEYBYTES.crypto_aead_chacha20poly1305_MESSAGEBYTES_MAX.crypto_aead_chacha20poly1305_NPUBBYTES.crypto_aead_chacha20poly1305_NSECBYTES.crypto_aead_chacha20poly1305_ietf_ABYTES.crypto_aead_chacha20poly1305_ietf_KEYBYTES.crypto_aead_chacha20poly1305_ietf_MESSAGEBYTES_MAX.crypto_aead_chacha20poly1305_ietf_NPUBBYTES.crypto_aead_chacha20poly1305_ietf_NSECBYTES.crypto_aead_xchacha20poly1305_IETF_ABYTES.crypto_aead_xchacha20poly1305_IETF_KEYBYTES.crypto_aead_xchacha20poly1305_IETF_MESSAGEBYTES_MAX.crypto_aead_xchacha20poly1305_IETF_NPUBBYTES.crypto_aead_xchacha20poly1305_IETF_NSECBYTES.crypto_aead_xchacha20poly1305_ietf_ABYTES.crypto_aead_xchacha20poly1305_ietf_KEYBYTES.crypto_aead_xchacha20poly1305_ietf_MESSAGEBYTES_MAX.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES.crypto_aead_xchacha20poly1305_ietf_NSECBYTES.crypto_auth_BYTES.crypto_auth_KEYBYTES.crypto_auth_hmacsha256_BYTES.crypto_auth_hmacsha256_KEYBYTES.crypto_auth_hmacsha512256_BYTES.crypto_auth_hmacsha512256_KEYBYTES.crypto_auth_hmacsha512_BYTES.crypto_auth_hmacsha512_KEYBYTES.crypto_box_BEFORENMBYTES.crypto_box_MACBYTES.crypto_box_MESSAGEBYTES_MAX.crypto_box_NONCEBYTES.crypto_box_PUBLICKEYBYTES.crypto_box_SEALBYTES.crypto_box_SECRETKEYBYTES.crypto_box_SEEDBYTES.crypto_box_curve25519xchacha20poly1305_BEFORENMBYTES.crypto_box_curve25519xchacha20poly1305_MACBYTES.crypto_box_curve25519xchacha20poly1305_MESSAGEBYTES_MAX.crypto_box_curve25519xchacha20poly1305_NONCEBYTES.crypto_box_curve25519xchacha20poly1305_PUBLICKEYBYTES.crypto_box_curve25519xchacha20poly1305_SEALBYTES.crypto_box_curve25519xchacha20poly1305_SECRETKEYBYTES.crypto_box_curve25519xchacha20poly1305_SEEDBYTES.crypto_box_curve25519xsalsa20poly1305_BEFORENMBYTES.crypto_box_curve25519xsalsa20poly1305_MACBYTES.crypto_box_curve25519xsalsa20poly1305_MESSAGEBYTES_MAX.crypto_box_curve25519xsalsa20poly1305_NONCEBYTES.crypto_box_curve25519xsalsa20poly1305_PUBLICKEYBYTES.crypto_box_curve25519xsalsa20poly1305_SECRETKEYBYTES.crypto_box_curve25519xsalsa20poly1305_SEEDBYTES.crypto_core_ed25519_BYTES.crypto_core_ed25519_HASHBYTES.crypto_core_ed25519_NONREDUCEDSCALARBYTES.crypto_core_ed25519_SCALARBYTES.crypto_core_ed25519_UNIFORMBYTES.crypto_core_hchacha20_CONSTBYTES.crypto_core_hchacha20_INPUTBYTES.crypto_core_hchacha20_KEYBYTES.crypto_core_hchacha20_OUTPUTBYTES.crypto_core_hsalsa20_CONSTBYTES.crypto_core_hsalsa20_INPUTBYTES.crypto_core_hsalsa20_KEYBYTES.crypto_core_hsalsa20_OUTPUTBYTES.crypto_core_ristretto255_BYTES.crypto_core_ristretto255_HASHBYTES.crypto_core_ristretto255_NONREDUCEDSCALARBYTES.crypto_core_ristretto255_SCALARBYTES.crypto_core_salsa2012_CONSTBYTES.crypto_core_salsa2012_INPUTBYTES.crypto_core_salsa2012_KEYBYTES.crypto_core_salsa2012_OUTPUTBYTES.crypto_core_salsa208_CONSTBYTES.crypto_core_salsa208_INPUTBYTES.crypto_core_salsa208_KEYBYTES.crypto_core_salsa208_OUTPUTBYTES.crypto_core_salsa20_CONSTBYTES.crypto_core_salsa20_INPUTBYTES.crypto_core_salsa20_KEYBYTES.crypto_core_salsa20_OUTPUTBYTES.crypto_generichash_BYTES.crypto_generichash_BYTES_MAX.crypto_generichash_BYTES_MIN.crypto_generichash_KEYBYTES.crypto_generichash_KEYBYTES_MAX.crypto_generichash_KEYBYTES_MIN.crypto_generichash_blake2b_BYTES.crypto_generichash_blake2b_BYTES_MAX.crypto_generichash_blake2b_BYTES_MIN.crypto_generichash_blake2b_KEYBYTES.crypto_generichash_blake2b_KEYBYTES_MAX.crypto_generichash_blake2b_KEYBYTES_MIN.crypto_generichash_blake2b_PERSONALBYTES.crypto_generichash_blake2b_SALTBYTES.crypto_hash_BYTES.crypto_hash_sha256_BYTES.crypto_hash_sha3256_BYTES.crypto_hash_sha3512_BYTES.crypto_hash_sha512_BYTES.crypto_ipcrypt_BYTES.crypto_ipcrypt_KEYBYTES.crypto_ipcrypt_NDX_INPUTBYTES.crypto_ipcrypt_NDX_KEYBYTES.crypto_ipcrypt_NDX_OUTPUTBYTES.crypto_ipcrypt_NDX_TWEAKBYTES.crypto_ipcrypt_ND_INPUTBYTES.crypto_ipcrypt_ND_KEYBYTES.crypto_ipcrypt_ND_OUTPUTBYTES.crypto_ipcrypt_ND_TWEAKBYTES.crypto_ipcrypt_PFX_BYTES.crypto_ipcrypt_PFX_KEYBYTES.crypto_kdf_BYTES_MAX.crypto_kdf_BYTES_MIN.crypto_kdf_CONTEXTBYTES.crypto_kdf_KEYBYTES.crypto_kdf_blake2b_BYTES_MAX.crypto_kdf_blake2b_BYTES_MIN.crypto_kdf_blake2b_CONTEXTBYTES.crypto_kdf_blake2b_KEYBYTES.crypto_kdf_hkdf_sha256_BYTES_MAX.crypto_kdf_hkdf_sha256_BYTES_MIN.crypto_kdf_hkdf_sha256_KEYBYTES.crypto_kdf_hkdf_sha512_BYTES_MAX.crypto_kdf_hkdf_sha512_BYTES_MIN.crypto_kdf_hkdf_sha512_KEYBYTES.crypto_kem_CIPHERTEXTBYTES.crypto_kem_PUBLICKEYBYTES.crypto_kem_SECRETKEYBYTES.crypto_kem_SEEDBYTES.crypto_kem_SHAREDSECRETBYTES.crypto_kem_mlkem768_CIPHERTEXTBYTES.crypto_kem_mlkem768_PUBLICKEYBYTES.crypto_kem_mlkem768_SECRETKEYBYTES.crypto_kem_mlkem768_SEEDBYTES.crypto_kem_mlkem768_SHAREDSECRETBYTES.crypto_kem_xwing_CIPHERTEXTBYTES.crypto_kem_xwing_PUBLICKEYBYTES.crypto_kem_xwing_SECRETKEYBYTES.crypto_kem_xwing_SEEDBYTES.crypto_kem_xwing_SHAREDSECRETBYTES.crypto_kx_PUBLICKEYBYTES.crypto_kx_SECRETKEYBYTES.crypto_kx_SEEDBYTES.crypto_kx_SESSIONKEYBYTES.crypto_onetimeauth_BYTES.crypto_onetimeauth_KEYBYTES.crypto_onetimeauth_poly1305_BYTES.crypto_onetimeauth_poly1305_KEYBYTES.crypto_pwhash_ALG_ARGON2I13.crypto_pwhash_ALG_ARGON2ID13.crypto_pwhash_ALG_DEFAULT.crypto_pwhash_BYTES_MAX.crypto_pwhash_BYTES_MIN.crypto_pwhash_MEMLIMIT_INTERACTIVE.crypto_pwhash_MEMLIMIT_MAX.crypto_pwhash_MEMLIMIT_MIN.crypto_pwhash_MEMLIMIT_MODERATE.crypto_pwhash_MEMLIMIT_SENSITIVE.crypto_pwhash_OPSLIMIT_INTERACTIVE.crypto_pwhash_OPSLIMIT_MAX.crypto_pwhash_OPSLIMIT_MIN.crypto_pwhash_OPSLIMIT_MODERATE.crypto_pwhash_OPSLIMIT_SENSITIVE.crypto_pwhash_PASSWD_MAX.crypto_pwhash_PASSWD_MIN.crypto_pwhash_SALTBYTES.crypto_pwhash_STRBYTES.crypto_pwhash_argon2i_BYTES_MAX.crypto_pwhash_argon2i_BYTES_MIN.crypto_pwhash_argon2i_MEMLIMIT_INTERACTIVE.crypto_pwhash_argon2i_MEMLIMIT_MAX.crypto_pwhash_argon2i_MEMLIMIT_MIN.crypto_pwhash_argon2i_MEMLIMIT_MODERATE.crypto_pwhash_argon2i_MEMLIMIT_SENSITIVE.crypto_pwhash_argon2i_OPSLIMIT_INTERACTIVE.crypto_pwhash_argon2i_OPSLIMIT_MAX.crypto_pwhash_argon2i_OPSLIMIT_MIN.crypto_pwhash_argon2i_OPSLIMIT_MODERATE.crypto_pwhash_argon2i_OPSLIMIT_SENSITIVE.crypto_pwhash_argon2i_PASSWD_MAX.crypto_pwhash_argon2i_PASSWD_MIN.crypto_pwhash_argon2i_SALTBYTES.crypto_pwhash_argon2i_STRBYTES.crypto_pwhash_argon2id_BYTES_MAX.crypto_pwhash_argon2id_BYTES_MIN.crypto_pwhash_argon2id_MEMLIMIT_INTERACTIVE.crypto_pwhash_argon2id_MEMLIMIT_MAX.crypto_pwhash_argon2id_MEMLIMIT_MIN.crypto_pwhash_argon2id_MEMLIMIT_MODERATE.crypto_pwhash_argon2id_MEMLIMIT_SENSITIVE.crypto_pwhash_argon2id_OPSLIMIT_INTERACTIVE.crypto_pwhash_argon2id_OPSLIMIT_MAX.crypto_pwhash_argon2id_OPSLIMIT_MIN.crypto_pwhash_argon2id_OPSLIMIT_MODERATE.crypto_pwhash_argon2id_OPSLIMIT_SENSITIVE.crypto_pwhash_argon2id_PASSWD_MAX.crypto_pwhash_argon2id_PASSWD_MIN.crypto_pwhash_argon2id_SALTBYTES.crypto_pwhash_argon2id_STRBYTES.crypto_pwhash_scryptsalsa208sha256_BYTES_MAX.crypto_pwhash_scryptsalsa208sha256_BYTES_MIN.crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_INTERACTIVE.crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_MAX.crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_MIN.crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_SENSITIVE.crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_INTERACTIVE.crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_MAX.crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_MIN.crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_SENSITIVE.crypto_pwhash_scryptsalsa208sha256_PASSWD_MAX.crypto_pwhash_scryptsalsa208sha256_PASSWD_MIN.crypto_pwhash_scryptsalsa208sha256_SALTBYTES.crypto_pwhash_scryptsalsa208sha256_STRBYTES.crypto_scalarmult_BYTES.crypto_scalarmult_SCALARBYTES.crypto_scalarmult_curve25519_BYTES.crypto_scalarmult_curve25519_SCALARBYTES.crypto_scalarmult_ed25519_BYTES.crypto_scalarmult_ed25519_SCALARBYTES.crypto_scalarmult_ristretto255_BYTES.crypto_scalarmult_ristretto255_SCALARBYTES.crypto_secretbox_KEYBYTES.crypto_secretbox_MACBYTES.crypto_secretbox_MESSAGEBYTES_MAX.crypto_secretbox_NONCEBYTES.crypto_secretbox_xchacha20poly1305_KEYBYTES.crypto_secretbox_xchacha20poly1305_MACBYTES.crypto_secretbox_xchacha20poly1305_MESSAGEBYTES_MAX.crypto_secretbox_xchacha20poly1305_NONCEBYTES.crypto_secretbox_xsalsa20poly1305_KEYBYTES.crypto_secretbox_xsalsa20poly1305_MACBYTES.crypto_secretbox_xsalsa20poly1305_MESSAGEBYTES_MAX.crypto_secretbox_xsalsa20poly1305_NONCEBYTES.crypto_secretstream_xchacha20poly1305_ABYTES.crypto_secretstream_xchacha20poly1305_HEADERBYTES.crypto_secretstream_xchacha20poly1305_KEYBYTES.crypto_secretstream_xchacha20poly1305_MESSAGEBYTES_MAX.crypto_secretstream_xchacha20poly1305_TAG_FINAL.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE.crypto_secretstream_xchacha20poly1305_TAG_PUSH.crypto_secretstream_xchacha20poly1305_TAG_REKEY.crypto_shorthash_BYTES.crypto_shorthash_KEYBYTES.crypto_shorthash_siphash24_BYTES.crypto_shorthash_siphash24_KEYBYTES.crypto_shorthash_siphashx24_BYTES.crypto_shorthash_siphashx24_KEYBYTES.crypto_sign_BYTES.crypto_sign_MESSAGEBYTES_MAX.crypto_sign_PUBLICKEYBYTES.crypto_sign_SECRETKEYBYTES.crypto_sign_SEEDBYTES.crypto_sign_ed25519_BYTES.crypto_sign_ed25519_MESSAGEBYTES_MAX.crypto_sign_ed25519_PUBLICKEYBYTES.crypto_sign_ed25519_SECRETKEYBYTES.crypto_sign_ed25519_SEEDBYTES.crypto_stream_KEYBYTES.crypto_stream_MESSAGEBYTES_MAX.crypto_stream_NONCEBYTES.crypto_stream_chacha20_IETF_KEYBYTES.crypto_stream_chacha20_IETF_MESSAGEBYTES_MAX.crypto_stream_chacha20_IETF_NONCEBYTES.crypto_stream_chacha20_KEYBYTES.crypto_stream_chacha20_MESSAGEBYTES_MAX.crypto_stream_chacha20_NONCEBYTES.crypto_stream_chacha20_ietf_KEYBYTES.crypto_stream_chacha20_ietf_MESSAGEBYTES_MAX.crypto_stream_chacha20_ietf_NONCEBYTES.crypto_stream_salsa2012_KEYBYTES.crypto_stream_salsa2012_MESSAGEBYTES_MAX.crypto_stream_salsa2012_NONCEBYTES.crypto_stream_salsa208_KEYBYTES.crypto_stream_salsa208_MESSAGEBYTES_MAX.crypto_stream_salsa208_NONCEBYTES.crypto_stream_salsa20_KEYBYTES.crypto_stream_salsa20_MESSAGEBYTES_MAX.crypto_stream_salsa20_NONCEBYTES.crypto_stream_xchacha20_KEYBYTES.crypto_stream_xchacha20_MESSAGEBYTES_MAX.crypto_stream_xchacha20_NONCEBYTES.crypto_stream_xsalsa20_KEYBYTES.crypto_stream_xsalsa20_MESSAGEBYTES_MAX.crypto_stream_xsalsa20_NONCEBYTES.crypto_verify_16_BYTES.crypto_verify_32_BYTES.crypto_verify_64_BYTES.crypto_xof_shake128_BLOCKBYTES.crypto_xof_shake128_STATEBYTES.crypto_xof_shake256_BLOCKBYTES.crypto_xof_shake256_STATEBYTES.crypto_xof_turboshake128_BLOCKBYTES.crypto_xof_turboshake128_STATEBYTES.crypto_xof_turboshake256_BLOCKBYTES.crypto_xof_turboshake256_STATEBYTES".split(".");
		for (n = 0; n < r.length; n++) typeof (a = U["_" + r[n].toLowerCase()]) == "function" && (W[r[n]] = a());
		var i = [
			"SODIUM_VERSION_STRING",
			"crypto_kem_PRIMITIVE",
			"crypto_pwhash_STRPREFIX",
			"crypto_pwhash_argon2i_STRPREFIX",
			"crypto_pwhash_argon2id_STRPREFIX",
			"crypto_pwhash_scryptsalsa208sha256_STRPREFIX"
		];
		for (n = 0; n < i.length; n++) {
			var a;
			typeof (a = U["_" + i[n].toLowerCase()]) == "function" && (W[i[n]] = U.UTF8ToString(a()));
		}
	}();
	var t = new Uint8Array([
		98,
		97,
		108,
		108,
		115
	]), n = W.randombytes_buf(W.crypto_secretbox_NONCEBYTES), r = W.randombytes_buf(W.crypto_secretbox_KEYBYTES), i = W.crypto_secretbox_easy(t, n, r), a = W.crypto_secretbox_open_easy(i, n, r);
	if (!W.memcmp(t, a)) throw Error("Initialization self-test failed");
});
function hs() {
	return Object.keys(W).sort();
}
function gs(e) {
	if (!(e instanceof Uint8Array)) throw TypeError("Only Uint8Array instances can be incremented");
	for (var t = 256, n = 0, r = e.length; n < r; n++) t >>= 8, t += e[n], e[n] = 255 & t;
}
function _s(e, t) {
	if (!(e instanceof Uint8Array && t instanceof Uint8Array)) throw TypeError("Only Uint8Array instances can be added");
	var n = e.length, r = 0, i = 0;
	if (t.length !== e.length) throw TypeError("Arguments must have the same length");
	for (i = 0; i < n; i++) r >>= 8, r += e[i] + t[i], e[i] = 255 & r;
}
function vs(e) {
	if (!(e instanceof Uint8Array)) throw TypeError("Only Uint8Array instances can be checked");
	for (var t = 0, n = 0, r = e.length; n < r; n++) t |= e[n];
	return t === 0;
}
function ys(e) {
	if (!(e instanceof Uint8Array)) throw TypeError("Only Uint8Array instances can be wiped");
	for (var t = 0, n = e.length; t < n; t++) e[t] = 0;
}
function bs(e, t) {
	if (!(e instanceof Uint8Array && t instanceof Uint8Array)) throw TypeError("Only Uint8Array instances can be compared");
	if (e.length !== t.length) throw TypeError("Only instances of identical length can be compared");
	for (var n = 0, r = 0, i = e.length; r < i; r++) n |= e[r] ^ t[r];
	return n === 0;
}
function xs(e, t) {
	if (!(e instanceof Uint8Array && t instanceof Uint8Array)) throw TypeError("Only Uint8Array instances can be compared");
	if (e.length !== t.length) throw TypeError("Only instances of identical length can be compared");
	for (var n = 0, r = 1, i = e.length; i-- > 0;) n |= t[i] - e[i] >> 8 & r, r &= (t[i] ^ e[i]) - 1 >> 8;
	return n + n + r - 1;
}
function Ss(e, t) {
	if (!(e instanceof Uint8Array)) throw TypeError("buffer must be a Uint8Array");
	if ((t |= 0) <= 0) throw Error("block size must be > 0");
	var n, r = [], i = Ps(4), a = 1, o = 0, s = 0 | e.length, c = new q(s + t);
	r.push(i), r.push(c.address);
	for (var l = c.address, u = c.address + s + t; l < u; l++) U.HEAPU8[l] = e[o], o += a = 1 & ~((65535 & ((s -= a) >>> 48 | s >>> 32 | s >>> 16 | s)) - 1 >> 16);
	return U._sodium_pad(i, c.address, e.length, t, c.length) !== 0 && X(r, "internal error"), c.length = U.getValue(i, "i32"), n = c.to_Uint8Array(), Y(r), n;
}
function Cs(e, t) {
	if (!(e instanceof Uint8Array)) throw TypeError("buffer must be a Uint8Array");
	if ((t |= 0) <= 0) throw Error("block size must be > 0");
	var n = [], r = J(e), i = Ps(4);
	return n.push(r), n.push(i), U._sodium_unpad(i, r, e.length, t) !== 0 && X(n, "unsupported/invalid padding"), e = (e = new Uint8Array(e)).subarray(0, U.getValue(i, "i32")), Y(n), e;
}
function ws(e) {
	if (typeof TextEncoder == "function") return new TextEncoder().encode(e);
	e = unescape(encodeURIComponent(e));
	for (var t = new Uint8Array(e.length), n = 0, r = e.length; n < r; n++) t[n] = e.charCodeAt(n);
	return t;
}
function Ts(e) {
	if (typeof TextDecoder == "function") return new TextDecoder("utf-8", { fatal: !0 }).decode(e);
	var t = 8192, n = Math.ceil(e.length / t);
	if (n <= 1) try {
		return decodeURIComponent(escape(String.fromCharCode.apply(null, e)));
	} catch {
		throw TypeError("The encoded data was not valid.");
	}
	for (var r = "", i = 0, a = 0; a < n; a++) {
		var o = Array.prototype.slice.call(e, a * t + i, (a + 1) * t + i);
		if (o.length !== 0) {
			var s, c = o.length, l = 0;
			do {
				var u = o[--c];
				u >= 240 ? (l = 4, s = !0) : u >= 224 ? (l = 3, s = !0) : u >= 192 ? (l = 2, s = !0) : u < 128 && (l = 1, s = !0);
			} while (!s);
			for (var d = l - (o.length - c), f = 0; f < d; f++) i--, o.pop();
			r += Ts(o);
		}
	}
	return r;
}
function Es(e) {
	var t, n = [], r = new q((e = $(n, e, "input")).length / 2), i = J(e), a = Ps(4);
	return n.push(i), n.push(r.address), n.push(a), U._sodium_hex2bin(r.address, r.length, i, e.length, 0, 0, a) !== 0 && X(n, "invalid input"), U.getValue(a, "i32") - i !== e.length && X(n, "incomplete input"), t = r.to_Uint8Array(), Y(n), t;
}
function Ds(e) {
	e = $(null, e, "input");
	for (var t, n, r, i = "", a = 0; a < e.length; a++) r = 87 + (n = 15 & e[a]) + (n - 10 >> 8 & -39) << 8 | 87 + (t = e[a] >>> 4) + (t - 10 >> 8 & -39), i += String.fromCharCode(255 & r) + String.fromCharCode(r >>> 8);
	return i;
}
var Os = {
	ORIGINAL: 1,
	ORIGINAL_NO_PADDING: 3,
	URLSAFE: 5,
	URLSAFE_NO_PADDING: 7
};
function ks(e) {
	if (e === void 0) return Os.URLSAFE_NO_PADDING;
	if (e !== Os.ORIGINAL && e !== Os.ORIGINAL_NO_PADDING && e !== Os.URLSAFE && e !== Os.URLSAFE_NO_PADDING) throw Error("unsupported base64 variant");
	return e;
}
function As(e, t) {
	t = ks(t);
	var n, r = [], i = new q(3 * (e = $(r, e, "input")).length / 4), a = J(e), o = Ps(4), s = Ps(4);
	return r.push(a), r.push(i.address), r.push(o), r.push(s), U._sodium_base642bin(i.address, i.length, a, e.length, 0, o, s, t) !== 0 && X(r, "invalid input"), U.getValue(s, "i32") - a !== e.length && X(r, "incomplete input"), i.length = U.getValue(o, "i32"), n = i.to_Uint8Array(), Y(r), n;
}
function js(e, t) {
	t = ks(t);
	var n = [];
	e = $(n, e, "input");
	var r, i = 0 | Math.floor(e.length / 3), a = e.length - 3 * i, o = 4 * i + (a === 0 ? 0 : 2 & t ? 2 + (a >>> 1) : 4), s = new q(o + 1), c = J(e);
	return n.push(c), n.push(s.address), U._sodium_bin2base64(s.address, s.length, c, e.length, t) === 0 && X(n, "conversion failed"), s.length = o, r = Ts(s.to_Uint8Array()), Y(n), r;
}
function Ms() {
	return [
		"uint8array",
		"text",
		"hex",
		"base64"
	];
}
function G(e, t) {
	var n = t || "uint8array";
	if (!Ns(n)) throw Error(n + " output format is not available");
	if (e instanceof q) {
		if (n === "uint8array") return e.to_Uint8Array();
		if (n === "text") return Ts(e.to_Uint8Array());
		if (n === "hex") return Ds(e.to_Uint8Array());
		if (n === "base64") return js(e.to_Uint8Array(), Os.URLSAFE_NO_PADDING);
		throw Error("What is output format \"" + n + "\"?");
	}
	if (typeof e == "object") {
		for (var r = Object.keys(e), i = {}, a = 0; a < r.length; a++) i[r[a]] = G(e[r[a]], n);
		return i;
	}
	if (typeof e == "string") return e;
	throw TypeError("Cannot format output");
}
function Ns(e) {
	for (var t = [
		"uint8array",
		"text",
		"hex",
		"base64"
	], n = 0; n < t.length; n++) if (t[n] === e) return !0;
	return !1;
}
function K(e) {
	if (e) {
		if (typeof e != "string") throw TypeError("When defined, the output format must be a string");
		if (!Ns(e)) throw Error(e + " is not a supported output format");
	}
}
function q(e) {
	this.length = e, this.address = Ps(e);
}
function J(e) {
	var t = Ps(e.length);
	return U.HEAPU8.set(e, t), t;
}
function Ps(e) {
	var t = U._malloc(e);
	if (t === 0) throw {
		message: "_malloc() failed",
		length: e
	};
	return t;
}
function Fs(e) {
	U._free(e);
}
function Y(e) {
	if (e) for (var t = 0; t < e.length; t++) Fs(e[t]);
}
function X(e, t) {
	throw Y(e), Error(t);
}
function Z(e, t) {
	throw Y(e), TypeError(t);
}
function Q(e, t, n) {
	t ?? Z(e, n + " cannot be null or undefined");
}
function $(e, t, n) {
	return Q(e, t, n), t instanceof Uint8Array ? t : typeof t == "string" ? ws(t) : void Z(e, "unsupported input type for " + n);
}
function Is(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = null;
	e != null && (s = J(e = $(o, e, "secret_nonce")), e.length, o.push(s)), t = $(o, t, "ciphertext");
	var c, l = U._crypto_aead_aegis128l_abytes(), u = t.length;
	u < l && Z(o, "ciphertext is too short"), c = J(t), o.push(c);
	var d = null, f = 0;
	n != null && (d = J(n = $(o, n, "additional_data")), f = n.length, o.push(d)), r = $(o, r, "public_nonce");
	var p, m = 0 | U._crypto_aead_aegis128l_npubbytes();
	r.length !== m && Z(o, "invalid public_nonce length"), p = J(r), o.push(p), i = $(o, i, "key");
	var h, g = 0 | U._crypto_aead_aegis128l_keybytes();
	i.length !== g && Z(o, "invalid key length"), h = J(i), o.push(h);
	var _ = new q(u - U._crypto_aead_aegis128l_abytes() | 0), v = _.address;
	if (o.push(v), U._crypto_aead_aegis128l_decrypt(v, null, s, c, u, 0, d, f, 0, p, h) === 0) {
		var y = G(_, a);
		return Y(o), y;
	}
	X(o, "ciphertext cannot be decrypted using that key");
}
function Ls(e, t, n, r, i, a, o) {
	var s = [];
	K(o);
	var c = null;
	e != null && (c = J(e = $(s, e, "secret_nonce")), e.length, s.push(c));
	var l = J(t = $(s, t, "ciphertext")), u = t.length;
	s.push(l), n = $(s, n, "mac");
	var d, f = 0 | U._crypto_aead_aegis128l_abytes();
	n.length !== f && Z(s, "invalid mac length"), d = J(n), s.push(d);
	var p = null, m = 0;
	r != null && (p = J(r = $(s, r, "additional_data")), m = r.length, s.push(p)), i = $(s, i, "public_nonce");
	var h, g = 0 | U._crypto_aead_aegis128l_npubbytes();
	i.length !== g && Z(s, "invalid public_nonce length"), h = J(i), s.push(h), a = $(s, a, "key");
	var _, v = 0 | U._crypto_aead_aegis128l_keybytes();
	a.length !== v && Z(s, "invalid key length"), _ = J(a), s.push(_);
	var y = new q(0 | u), b = y.address;
	if (s.push(b), U._crypto_aead_aegis128l_decrypt_detached(b, c, l, u, 0, d, p, m, 0, h, _) === 0) {
		var x = G(y, o);
		return Y(s), x;
	}
	X(s, "ciphertext cannot be decrypted using that key");
}
function Rs(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_aegis128l_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_aegis128l_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(c + U._crypto_aead_aegis128l_abytes() | 0), _ = g.address;
	if (o.push(_), U._crypto_aead_aegis128l_encrypt(_, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var v = G(g, a);
		return Y(o), v;
	}
	X(o, "invalid usage");
}
function zs(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_aegis128l_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_aegis128l_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(0 | c), _ = g.address;
	o.push(_);
	var v = new q(0 | U._crypto_aead_aegis128l_abytes()), y = v.address;
	if (o.push(y), U._crypto_aead_aegis128l_encrypt_detached(_, y, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var b = G({
			ciphertext: g,
			mac: v
		}, a);
		return Y(o), b;
	}
	X(o, "invalid usage");
}
function Bs(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_aead_aegis128l_keybytes()), r = n.address;
	t.push(r), U._crypto_aead_aegis128l_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function Vs(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = null;
	e != null && (s = J(e = $(o, e, "secret_nonce")), e.length, o.push(s)), t = $(o, t, "ciphertext");
	var c, l = U._crypto_aead_aegis256_abytes(), u = t.length;
	u < l && Z(o, "ciphertext is too short"), c = J(t), o.push(c);
	var d = null, f = 0;
	n != null && (d = J(n = $(o, n, "additional_data")), f = n.length, o.push(d)), r = $(o, r, "public_nonce");
	var p, m = 0 | U._crypto_aead_aegis256_npubbytes();
	r.length !== m && Z(o, "invalid public_nonce length"), p = J(r), o.push(p), i = $(o, i, "key");
	var h, g = 0 | U._crypto_aead_aegis256_keybytes();
	i.length !== g && Z(o, "invalid key length"), h = J(i), o.push(h);
	var _ = new q(u - U._crypto_aead_aegis256_abytes() | 0), v = _.address;
	if (o.push(v), U._crypto_aead_aegis256_decrypt(v, null, s, c, u, 0, d, f, 0, p, h) === 0) {
		var y = G(_, a);
		return Y(o), y;
	}
	X(o, "ciphertext cannot be decrypted using that key");
}
function Hs(e, t, n, r, i, a, o) {
	var s = [];
	K(o);
	var c = null;
	e != null && (c = J(e = $(s, e, "secret_nonce")), e.length, s.push(c));
	var l = J(t = $(s, t, "ciphertext")), u = t.length;
	s.push(l), n = $(s, n, "mac");
	var d, f = 0 | U._crypto_aead_aegis256_abytes();
	n.length !== f && Z(s, "invalid mac length"), d = J(n), s.push(d);
	var p = null, m = 0;
	r != null && (p = J(r = $(s, r, "additional_data")), m = r.length, s.push(p)), i = $(s, i, "public_nonce");
	var h, g = 0 | U._crypto_aead_aegis256_npubbytes();
	i.length !== g && Z(s, "invalid public_nonce length"), h = J(i), s.push(h), a = $(s, a, "key");
	var _, v = 0 | U._crypto_aead_aegis256_keybytes();
	a.length !== v && Z(s, "invalid key length"), _ = J(a), s.push(_);
	var y = new q(0 | u), b = y.address;
	if (s.push(b), U._crypto_aead_aegis256_decrypt_detached(b, c, l, u, 0, d, p, m, 0, h, _) === 0) {
		var x = G(y, o);
		return Y(s), x;
	}
	X(s, "ciphertext cannot be decrypted using that key");
}
function Us(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_aegis256_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_aegis256_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(c + U._crypto_aead_aegis256_abytes() | 0), _ = g.address;
	if (o.push(_), U._crypto_aead_aegis256_encrypt(_, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var v = G(g, a);
		return Y(o), v;
	}
	X(o, "invalid usage");
}
function Ws(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_aegis256_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_aegis256_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(0 | c), _ = g.address;
	o.push(_);
	var v = new q(0 | U._crypto_aead_aegis256_abytes()), y = v.address;
	if (o.push(y), U._crypto_aead_aegis256_encrypt_detached(_, y, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var b = G({
			ciphertext: g,
			mac: v
		}, a);
		return Y(o), b;
	}
	X(o, "invalid usage");
}
function Gs(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_aead_aegis256_keybytes()), r = n.address;
	t.push(r), U._crypto_aead_aegis256_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function Ks(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = null;
	e != null && (s = J(e = $(o, e, "secret_nonce")), e.length, o.push(s)), t = $(o, t, "ciphertext");
	var c, l = U._crypto_aead_chacha20poly1305_abytes(), u = t.length;
	u < l && Z(o, "ciphertext is too short"), c = J(t), o.push(c);
	var d = null, f = 0;
	n != null && (d = J(n = $(o, n, "additional_data")), f = n.length, o.push(d)), r = $(o, r, "public_nonce");
	var p, m = 0 | U._crypto_aead_chacha20poly1305_npubbytes();
	r.length !== m && Z(o, "invalid public_nonce length"), p = J(r), o.push(p), i = $(o, i, "key");
	var h, g = 0 | U._crypto_aead_chacha20poly1305_keybytes();
	i.length !== g && Z(o, "invalid key length"), h = J(i), o.push(h);
	var _ = new q(u - U._crypto_aead_chacha20poly1305_abytes() | 0), v = _.address;
	if (o.push(v), U._crypto_aead_chacha20poly1305_decrypt(v, null, s, c, u, 0, d, f, 0, p, h) === 0) {
		var y = G(_, a);
		return Y(o), y;
	}
	X(o, "ciphertext cannot be decrypted using that key");
}
function qs(e, t, n, r, i, a, o) {
	var s = [];
	K(o);
	var c = null;
	e != null && (c = J(e = $(s, e, "secret_nonce")), e.length, s.push(c));
	var l = J(t = $(s, t, "ciphertext")), u = t.length;
	s.push(l), n = $(s, n, "mac");
	var d, f = 0 | U._crypto_box_macbytes();
	n.length !== f && Z(s, "invalid mac length"), d = J(n), s.push(d);
	var p = null, m = 0;
	r != null && (p = J(r = $(s, r, "additional_data")), m = r.length, s.push(p)), i = $(s, i, "public_nonce");
	var h, g = 0 | U._crypto_aead_chacha20poly1305_npubbytes();
	i.length !== g && Z(s, "invalid public_nonce length"), h = J(i), s.push(h), a = $(s, a, "key");
	var _, v = 0 | U._crypto_aead_chacha20poly1305_keybytes();
	a.length !== v && Z(s, "invalid key length"), _ = J(a), s.push(_);
	var y = new q(0 | u), b = y.address;
	if (s.push(b), U._crypto_aead_chacha20poly1305_decrypt_detached(b, c, l, u, 0, d, p, m, 0, h, _) === 0) {
		var x = G(y, o);
		return Y(s), x;
	}
	X(s, "ciphertext cannot be decrypted using that key");
}
function Js(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_chacha20poly1305_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_chacha20poly1305_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(c + U._crypto_aead_chacha20poly1305_abytes() | 0), _ = g.address;
	if (o.push(_), U._crypto_aead_chacha20poly1305_encrypt(_, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var v = G(g, a);
		return Y(o), v;
	}
	X(o, "invalid usage");
}
function Ys(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_chacha20poly1305_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_chacha20poly1305_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(0 | c), _ = g.address;
	o.push(_);
	var v = new q(0 | U._crypto_aead_chacha20poly1305_abytes()), y = v.address;
	if (o.push(y), U._crypto_aead_chacha20poly1305_encrypt_detached(_, y, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var b = G({
			ciphertext: g,
			mac: v
		}, a);
		return Y(o), b;
	}
	X(o, "invalid usage");
}
function Xs(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = null;
	e != null && (s = J(e = $(o, e, "secret_nonce")), e.length, o.push(s)), t = $(o, t, "ciphertext");
	var c, l = U._crypto_aead_chacha20poly1305_ietf_abytes(), u = t.length;
	u < l && Z(o, "ciphertext is too short"), c = J(t), o.push(c);
	var d = null, f = 0;
	n != null && (d = J(n = $(o, n, "additional_data")), f = n.length, o.push(d)), r = $(o, r, "public_nonce");
	var p, m = 0 | U._crypto_aead_chacha20poly1305_ietf_npubbytes();
	r.length !== m && Z(o, "invalid public_nonce length"), p = J(r), o.push(p), i = $(o, i, "key");
	var h, g = 0 | U._crypto_aead_chacha20poly1305_ietf_keybytes();
	i.length !== g && Z(o, "invalid key length"), h = J(i), o.push(h);
	var _ = new q(u - U._crypto_aead_chacha20poly1305_ietf_abytes() | 0), v = _.address;
	if (o.push(v), U._crypto_aead_chacha20poly1305_ietf_decrypt(v, null, s, c, u, 0, d, f, 0, p, h) === 0) {
		var y = G(_, a);
		return Y(o), y;
	}
	X(o, "ciphertext cannot be decrypted using that key");
}
function Zs(e, t, n, r, i, a, o) {
	var s = [];
	K(o);
	var c = null;
	e != null && (c = J(e = $(s, e, "secret_nonce")), e.length, s.push(c));
	var l = J(t = $(s, t, "ciphertext")), u = t.length;
	s.push(l), n = $(s, n, "mac");
	var d, f = 0 | U._crypto_box_macbytes();
	n.length !== f && Z(s, "invalid mac length"), d = J(n), s.push(d);
	var p = null, m = 0;
	r != null && (p = J(r = $(s, r, "additional_data")), m = r.length, s.push(p)), i = $(s, i, "public_nonce");
	var h, g = 0 | U._crypto_aead_chacha20poly1305_ietf_npubbytes();
	i.length !== g && Z(s, "invalid public_nonce length"), h = J(i), s.push(h), a = $(s, a, "key");
	var _, v = 0 | U._crypto_aead_chacha20poly1305_ietf_keybytes();
	a.length !== v && Z(s, "invalid key length"), _ = J(a), s.push(_);
	var y = new q(0 | u), b = y.address;
	if (s.push(b), U._crypto_aead_chacha20poly1305_ietf_decrypt_detached(b, c, l, u, 0, d, p, m, 0, h, _) === 0) {
		var x = G(y, o);
		return Y(s), x;
	}
	X(s, "ciphertext cannot be decrypted using that key");
}
function Qs(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_chacha20poly1305_ietf_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_chacha20poly1305_ietf_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(c + U._crypto_aead_chacha20poly1305_ietf_abytes() | 0), _ = g.address;
	if (o.push(_), U._crypto_aead_chacha20poly1305_ietf_encrypt(_, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var v = G(g, a);
		return Y(o), v;
	}
	X(o, "invalid usage");
}
function $s(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_chacha20poly1305_ietf_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_chacha20poly1305_ietf_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(0 | c), _ = g.address;
	o.push(_);
	var v = new q(0 | U._crypto_aead_chacha20poly1305_ietf_abytes()), y = v.address;
	if (o.push(y), U._crypto_aead_chacha20poly1305_ietf_encrypt_detached(_, y, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var b = G({
			ciphertext: g,
			mac: v
		}, a);
		return Y(o), b;
	}
	X(o, "invalid usage");
}
function ec(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_aead_chacha20poly1305_ietf_keybytes()), r = n.address;
	t.push(r), U._crypto_aead_chacha20poly1305_ietf_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function tc(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_aead_chacha20poly1305_keybytes()), r = n.address;
	t.push(r), U._crypto_aead_chacha20poly1305_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function nc(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = null;
	e != null && (s = J(e = $(o, e, "secret_nonce")), e.length, o.push(s)), t = $(o, t, "ciphertext");
	var c, l = U._crypto_aead_xchacha20poly1305_ietf_abytes(), u = t.length;
	u < l && Z(o, "ciphertext is too short"), c = J(t), o.push(c);
	var d = null, f = 0;
	n != null && (d = J(n = $(o, n, "additional_data")), f = n.length, o.push(d)), r = $(o, r, "public_nonce");
	var p, m = 0 | U._crypto_aead_xchacha20poly1305_ietf_npubbytes();
	r.length !== m && Z(o, "invalid public_nonce length"), p = J(r), o.push(p), i = $(o, i, "key");
	var h, g = 0 | U._crypto_aead_xchacha20poly1305_ietf_keybytes();
	i.length !== g && Z(o, "invalid key length"), h = J(i), o.push(h);
	var _ = new q(u - U._crypto_aead_xchacha20poly1305_ietf_abytes() | 0), v = _.address;
	if (o.push(v), U._crypto_aead_xchacha20poly1305_ietf_decrypt(v, null, s, c, u, 0, d, f, 0, p, h) === 0) {
		var y = G(_, a);
		return Y(o), y;
	}
	X(o, "ciphertext cannot be decrypted using that key");
}
function rc(e, t, n, r, i, a, o) {
	var s = [];
	K(o);
	var c = null;
	e != null && (c = J(e = $(s, e, "secret_nonce")), e.length, s.push(c));
	var l = J(t = $(s, t, "ciphertext")), u = t.length;
	s.push(l), n = $(s, n, "mac");
	var d, f = 0 | U._crypto_box_macbytes();
	n.length !== f && Z(s, "invalid mac length"), d = J(n), s.push(d);
	var p = null, m = 0;
	r != null && (p = J(r = $(s, r, "additional_data")), m = r.length, s.push(p)), i = $(s, i, "public_nonce");
	var h, g = 0 | U._crypto_aead_xchacha20poly1305_ietf_npubbytes();
	i.length !== g && Z(s, "invalid public_nonce length"), h = J(i), s.push(h), a = $(s, a, "key");
	var _, v = 0 | U._crypto_aead_xchacha20poly1305_ietf_keybytes();
	a.length !== v && Z(s, "invalid key length"), _ = J(a), s.push(_);
	var y = new q(0 | u), b = y.address;
	if (s.push(b), U._crypto_aead_xchacha20poly1305_ietf_decrypt_detached(b, c, l, u, 0, d, p, m, 0, h, _) === 0) {
		var x = G(y, o);
		return Y(s), x;
	}
	X(s, "ciphertext cannot be decrypted using that key");
}
function ic(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_xchacha20poly1305_ietf_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_xchacha20poly1305_ietf_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(c + U._crypto_aead_xchacha20poly1305_ietf_abytes() | 0), _ = g.address;
	if (o.push(_), U._crypto_aead_xchacha20poly1305_ietf_encrypt(_, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var v = G(g, a);
		return Y(o), v;
	}
	X(o, "invalid usage");
}
function ac(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "message")), c = e.length;
	o.push(s);
	var l = null, u = 0;
	t != null && (l = J(t = $(o, t, "additional_data")), u = t.length, o.push(l));
	var d = null;
	n != null && (d = J(n = $(o, n, "secret_nonce")), n.length, o.push(d)), r = $(o, r, "public_nonce");
	var f, p = 0 | U._crypto_aead_xchacha20poly1305_ietf_npubbytes();
	r.length !== p && Z(o, "invalid public_nonce length"), f = J(r), o.push(f), i = $(o, i, "key");
	var m, h = 0 | U._crypto_aead_xchacha20poly1305_ietf_keybytes();
	i.length !== h && Z(o, "invalid key length"), m = J(i), o.push(m);
	var g = new q(0 | c), _ = g.address;
	o.push(_);
	var v = new q(0 | U._crypto_aead_xchacha20poly1305_ietf_abytes()), y = v.address;
	if (o.push(y), U._crypto_aead_xchacha20poly1305_ietf_encrypt_detached(_, y, null, s, c, 0, l, u, 0, d, f, m) === 0) {
		var b = G({
			ciphertext: g,
			mac: v
		}, a);
		return Y(o), b;
	}
	X(o, "invalid usage");
}
function oc(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_aead_xchacha20poly1305_ietf_keybytes()), r = n.address;
	t.push(r), U._crypto_aead_xchacha20poly1305_ietf_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function sc(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_auth_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_auth_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_auth(l, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function cc(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_auth_hmacsha256_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_auth_hmacsha256_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_auth_hmacsha256(l, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function lc(e, t) {
	var n = [];
	K(t), Q(n, e, "state_address");
	var r = new q(0 | U._crypto_auth_hmacsha256_bytes()), i = r.address;
	if (n.push(i), !(0 | U._crypto_auth_hmacsha256_final(e, i))) {
		var a = (U._free(e), G(r, t));
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function uc(e, t) {
	var n = [];
	K(t);
	var r = null, i = 0;
	e != null && (r = J(e = $(n, e, "key")), i = e.length, n.push(r));
	var a = new q(208).address;
	if (!(0 | U._crypto_auth_hmacsha256_init(a, r, i))) {
		var o = a;
		return Y(n), o;
	}
	X(n, "invalid usage");
}
function dc(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_auth_hmacsha256_keybytes()), r = n.address;
	t.push(r), U._crypto_auth_hmacsha256_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function fc(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_auth_hmacsha256_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function pc(e, t, n) {
	var r = [];
	e = $(r, e, "tag");
	var i, a = 0 | U._crypto_auth_hmacsha256_bytes();
	e.length !== a && Z(r, "invalid tag length"), i = J(e), r.push(i);
	var o = J(t = $(r, t, "message")), s = t.length;
	r.push(o), n = $(r, n, "key");
	var c, l = 0 | U._crypto_auth_hmacsha256_keybytes();
	n.length !== l && Z(r, "invalid key length"), c = J(n), r.push(c);
	var u = !(0 | U._crypto_auth_hmacsha256_verify(i, o, s, 0, c));
	return Y(r), u;
}
function mc(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_auth_hmacsha512_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_auth_hmacsha512_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_auth_hmacsha512(l, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function hc(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_auth_hmacsha512256_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_auth_hmacsha512256_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_auth_hmacsha512256(l, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function gc(e, t) {
	var n = [];
	K(t), Q(n, e, "state_address");
	var r = new q(0 | U._crypto_auth_hmacsha512256_bytes()), i = r.address;
	if (n.push(i), !(0 | U._crypto_auth_hmacsha512256_final(e, i))) {
		var a = (U._free(e), G(r, t));
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function _c(e, t) {
	var n = [];
	K(t);
	var r = null, i = 0;
	e != null && (r = J(e = $(n, e, "key")), i = e.length, n.push(r));
	var a = new q(416).address;
	if (!(0 | U._crypto_auth_hmacsha512256_init(a, r, i))) {
		var o = a;
		return Y(n), o;
	}
	X(n, "invalid usage");
}
function vc(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_auth_hmacsha512256_keybytes()), r = n.address;
	t.push(r), U._crypto_auth_hmacsha512256_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function yc(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_auth_hmacsha512256_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function bc(e, t, n) {
	var r = [];
	e = $(r, e, "tag");
	var i, a = 0 | U._crypto_auth_hmacsha512256_bytes();
	e.length !== a && Z(r, "invalid tag length"), i = J(e), r.push(i);
	var o = J(t = $(r, t, "message")), s = t.length;
	r.push(o), n = $(r, n, "key");
	var c, l = 0 | U._crypto_auth_hmacsha512256_keybytes();
	n.length !== l && Z(r, "invalid key length"), c = J(n), r.push(c);
	var u = !(0 | U._crypto_auth_hmacsha512256_verify(i, o, s, 0, c));
	return Y(r), u;
}
function xc(e, t) {
	var n = [];
	K(t), Q(n, e, "state_address");
	var r = new q(0 | U._crypto_auth_hmacsha512_bytes()), i = r.address;
	if (n.push(i), !(0 | U._crypto_auth_hmacsha512_final(e, i))) {
		var a = (U._free(e), G(r, t));
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function Sc(e, t) {
	var n = [];
	K(t);
	var r = null, i = 0;
	e != null && (r = J(e = $(n, e, "key")), i = e.length, n.push(r));
	var a = new q(416).address;
	if (!(0 | U._crypto_auth_hmacsha512_init(a, r, i))) {
		var o = a;
		return Y(n), o;
	}
	X(n, "invalid usage");
}
function Cc(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_auth_hmacsha512_keybytes()), r = n.address;
	t.push(r), U._crypto_auth_hmacsha512_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function wc(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_auth_hmacsha512_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function Tc(e, t, n) {
	var r = [];
	e = $(r, e, "tag");
	var i, a = 0 | U._crypto_auth_hmacsha512_bytes();
	e.length !== a && Z(r, "invalid tag length"), i = J(e), r.push(i);
	var o = J(t = $(r, t, "message")), s = t.length;
	r.push(o), n = $(r, n, "key");
	var c, l = 0 | U._crypto_auth_hmacsha512_keybytes();
	n.length !== l && Z(r, "invalid key length"), c = J(n), r.push(c);
	var u = !(0 | U._crypto_auth_hmacsha512_verify(i, o, s, 0, c));
	return Y(r), u;
}
function Ec(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_auth_keybytes()), r = n.address;
	t.push(r), U._crypto_auth_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function Dc(e, t, n) {
	var r = [];
	e = $(r, e, "tag");
	var i, a = 0 | U._crypto_auth_bytes();
	e.length !== a && Z(r, "invalid tag length"), i = J(e), r.push(i);
	var o = J(t = $(r, t, "message")), s = t.length;
	r.push(o), n = $(r, n, "key");
	var c, l = 0 | U._crypto_auth_keybytes();
	n.length !== l && Z(r, "invalid key length"), c = J(n), r.push(c);
	var u = !(0 | U._crypto_auth_verify(i, o, s, 0, c));
	return Y(r), u;
}
function Oc(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "publicKey");
	var i, a = 0 | U._crypto_box_publickeybytes();
	e.length !== a && Z(r, "invalid publicKey length"), i = J(e), r.push(i), t = $(r, t, "privateKey");
	var o, s = 0 | U._crypto_box_secretkeybytes();
	t.length !== s && Z(r, "invalid privateKey length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_box_beforenmbytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_box_beforenm(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function kc(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "publicKey");
	var i, a = 0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes();
	e.length !== a && Z(r, "invalid publicKey length"), i = J(e), r.push(i), t = $(r, t, "privateKey");
	var o, s = 0 | U._crypto_box_curve25519xchacha20poly1305_secretkeybytes();
	t.length !== s && Z(r, "invalid privateKey length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_box_curve25519xchacha20poly1305_beforenmbytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_box_curve25519xchacha20poly1305_beforenm(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function Ac(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "message")), s = e.length;
	a.push(o), t = $(a, t, "nonce");
	var c, l = 0 | U._crypto_box_curve25519xchacha20poly1305_noncebytes();
	t.length !== l && Z(a, "invalid nonce length"), c = J(t), a.push(c), n = $(a, n, "publicKey");
	var u, d = 0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes();
	n.length !== d && Z(a, "invalid publicKey length"), u = J(n), a.push(u), r = $(a, r, "privateKey");
	var f, p = 0 | U._crypto_box_curve25519xchacha20poly1305_secretkeybytes();
	r.length !== p && Z(a, "invalid privateKey length"), f = J(r), a.push(f);
	var m = new q(0 | s), h = m.address;
	a.push(h);
	var g = new q(0 | U._crypto_box_curve25519xchacha20poly1305_macbytes()), _ = g.address;
	if (a.push(_), !(0 | U._crypto_box_curve25519xchacha20poly1305_detached(h, _, o, s, 0, c, u, f))) {
		var v = G({
			ciphertext: m,
			mac: g
		}, i);
		return Y(a), v;
	}
	X(a, "invalid usage");
}
function jc(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "message")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_box_curve25519xchacha20poly1305_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "sharedKey");
	var l, u = 0 | U._crypto_box_curve25519xchacha20poly1305_beforenmbytes();
	n.length !== u && Z(i, "invalid sharedKey length"), l = J(n), i.push(l);
	var d = new q(0 | o), f = d.address;
	i.push(f);
	var p = new q(0 | U._crypto_box_curve25519xchacha20poly1305_macbytes()), m = p.address;
	if (i.push(m), !(0 | U._crypto_box_curve25519xchacha20poly1305_detached_afternm(f, m, a, o, 0, s, l))) {
		var h = G({
			ciphertext: d,
			mac: p
		}, r);
		return Y(i), h;
	}
	X(i, "invalid usage");
}
function Mc(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "message")), s = e.length;
	a.push(o), t = $(a, t, "nonce");
	var c, l = 0 | U._crypto_box_curve25519xchacha20poly1305_noncebytes();
	t.length !== l && Z(a, "invalid nonce length"), c = J(t), a.push(c), n = $(a, n, "publicKey");
	var u, d = 0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes();
	n.length !== d && Z(a, "invalid publicKey length"), u = J(n), a.push(u), r = $(a, r, "privateKey");
	var f, p = 0 | U._crypto_box_curve25519xchacha20poly1305_secretkeybytes();
	r.length !== p && Z(a, "invalid privateKey length"), f = J(r), a.push(f);
	var m = new q(s + U._crypto_box_curve25519xchacha20poly1305_macbytes() | 0), h = m.address;
	if (a.push(h), !(0 | U._crypto_box_curve25519xchacha20poly1305_easy(h, o, s, 0, c, u, f))) {
		var g = G(m, i);
		return Y(a), g;
	}
	X(a, "invalid usage");
}
function Nc(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "message")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_box_curve25519xchacha20poly1305_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "sharedKey");
	var l, u = 0 | U._crypto_box_curve25519xchacha20poly1305_beforenmbytes();
	n.length !== u && Z(i, "invalid sharedKey length"), l = J(n), i.push(l);
	var d = new q(o + U._crypto_box_curve25519xchacha20poly1305_macbytes() | 0), f = d.address;
	if (i.push(f), !(0 | U._crypto_box_curve25519xchacha20poly1305_easy_afternm(f, a, o, 0, s, l))) {
		var p = G(d, r);
		return Y(i), p;
	}
	X(i, "invalid usage");
}
function Pc(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes()), r = n.address;
	t.push(r);
	var i = new q(0 | U._crypto_box_curve25519xchacha20poly1305_secretkeybytes()), a = i.address;
	t.push(a), U._crypto_box_curve25519xchacha20poly1305_keypair(r, a);
	var o = G({
		publicKey: n,
		privateKey: i,
		keyType: "curve25519"
	}, e);
	return Y(t), o;
}
function Fc(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "ciphertext")), c = e.length;
	o.push(s), t = $(o, t, "mac");
	var l, u = 0 | U._crypto_box_curve25519xchacha20poly1305_macbytes();
	t.length !== u && Z(o, "invalid mac length"), l = J(t), o.push(l), n = $(o, n, "nonce");
	var d, f = 0 | U._crypto_box_curve25519xchacha20poly1305_noncebytes();
	n.length !== f && Z(o, "invalid nonce length"), d = J(n), o.push(d), r = $(o, r, "publicKey");
	var p, m = 0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes();
	r.length !== m && Z(o, "invalid publicKey length"), p = J(r), o.push(p), i = $(o, i, "privateKey");
	var h, g = 0 | U._crypto_box_curve25519xchacha20poly1305_secretkeybytes();
	i.length !== g && Z(o, "invalid privateKey length"), h = J(i), o.push(h);
	var _ = new q(0 | c), v = _.address;
	if (o.push(v), !(0 | U._crypto_box_curve25519xchacha20poly1305_open_detached(v, s, l, c, 0, d, p, h))) {
		var y = G(_, a);
		return Y(o), y;
	}
	X(o, "incorrect key pair for the given ciphertext");
}
function Ic(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "ciphertext")), s = e.length;
	a.push(o), t = $(a, t, "mac");
	var c, l = 0 | U._crypto_box_curve25519xchacha20poly1305_macbytes();
	t.length !== l && Z(a, "invalid mac length"), c = J(t), a.push(c), n = $(a, n, "nonce");
	var u, d = 0 | U._crypto_box_curve25519xchacha20poly1305_noncebytes();
	n.length !== d && Z(a, "invalid nonce length"), u = J(n), a.push(u), r = $(a, r, "sharedKey");
	var f, p = 0 | U._crypto_box_curve25519xchacha20poly1305_beforenmbytes();
	r.length !== p && Z(a, "invalid sharedKey length"), f = J(r), a.push(f);
	var m = new q(0 | s), h = m.address;
	if (a.push(h), !(0 | U._crypto_box_curve25519xchacha20poly1305_open_detached_afternm(h, o, c, s, 0, u, f))) {
		var g = G(m, i);
		return Y(a), g;
	}
	X(a, "incorrect secret key for the given ciphertext");
}
function Lc(e, t, n, r, i) {
	var a = [];
	K(i), e = $(a, e, "ciphertext");
	var o, s = U._crypto_box_curve25519xchacha20poly1305_macbytes(), c = e.length;
	c < s && Z(a, "ciphertext is too short"), o = J(e), a.push(o), t = $(a, t, "nonce");
	var l, u = 0 | U._crypto_box_curve25519xchacha20poly1305_noncebytes();
	t.length !== u && Z(a, "invalid nonce length"), l = J(t), a.push(l), n = $(a, n, "publicKey");
	var d, f = 0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes();
	n.length !== f && Z(a, "invalid publicKey length"), d = J(n), a.push(d), r = $(a, r, "privateKey");
	var p, m = 0 | U._crypto_box_curve25519xchacha20poly1305_secretkeybytes();
	r.length !== m && Z(a, "invalid privateKey length"), p = J(r), a.push(p);
	var h = new q(c - U._crypto_box_curve25519xchacha20poly1305_macbytes() | 0), g = h.address;
	if (a.push(g), !(0 | U._crypto_box_curve25519xchacha20poly1305_open_easy(g, o, c, 0, l, d, p))) {
		var _ = G(h, i);
		return Y(a), _;
	}
	X(a, "incorrect key pair for the given ciphertext");
}
function Rc(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "ciphertext")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_box_curve25519xchacha20poly1305_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "sharedKey");
	var l, u = 0 | U._crypto_box_curve25519xchacha20poly1305_beforenmbytes();
	n.length !== u && Z(i, "invalid sharedKey length"), l = J(n), i.push(l);
	var d = new q(o - U._crypto_box_curve25519xchacha20poly1305_macbytes() | 0), f = d.address;
	if (i.push(f), !(0 | U._crypto_box_curve25519xchacha20poly1305_open_easy_afternm(f, a, o, 0, s, l))) {
		var p = G(d, r);
		return Y(i), p;
	}
	X(i, "incorrect secret key for the given ciphertext");
}
function zc(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "publicKey");
	var o, s = 0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes();
	t.length !== s && Z(r, "invalid publicKey length"), o = J(t), r.push(o);
	var c = new q(a + U._crypto_box_curve25519xchacha20poly1305_sealbytes() | 0), l = c.address;
	r.push(l), U._crypto_box_curve25519xchacha20poly1305_seal(l, i, a, 0, o);
	var u = G(c, n);
	return Y(r), u;
}
function Bc(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "ciphertext");
	var a, o = U._crypto_box_curve25519xchacha20poly1305_sealbytes(), s = e.length;
	s < o && Z(i, "ciphertext is too short"), a = J(e), i.push(a), t = $(i, t, "publicKey");
	var c, l = 0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes();
	t.length !== l && Z(i, "invalid publicKey length"), c = J(t), i.push(c), n = $(i, n, "secretKey");
	var u, d = 0 | U._crypto_box_curve25519xchacha20poly1305_secretkeybytes();
	n.length !== d && Z(i, "invalid secretKey length"), u = J(n), i.push(u);
	var f = new q(s - U._crypto_box_curve25519xchacha20poly1305_sealbytes() | 0), p = f.address;
	i.push(p), U._crypto_box_curve25519xchacha20poly1305_seal_open(p, a, s, 0, c, u);
	var m = G(f, r);
	return Y(i), m;
}
function Vc(e, t) {
	var n = [];
	K(t), e = $(n, e, "seed");
	var r, i = 0 | U._crypto_box_curve25519xchacha20poly1305_seedbytes();
	e.length !== i && Z(n, "invalid seed length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_box_curve25519xchacha20poly1305_publickeybytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_box_curve25519xchacha20poly1305_secretkeybytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_box_curve25519xchacha20poly1305_seed_keypair(o, c, r))) {
		var l = {
			publicKey: G(a, t),
			privateKey: G(s, t),
			keyType: "x25519"
		};
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function Hc(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "message")), s = e.length;
	a.push(o), t = $(a, t, "nonce");
	var c, l = 0 | U._crypto_box_noncebytes();
	t.length !== l && Z(a, "invalid nonce length"), c = J(t), a.push(c), n = $(a, n, "publicKey");
	var u, d = 0 | U._crypto_box_publickeybytes();
	n.length !== d && Z(a, "invalid publicKey length"), u = J(n), a.push(u), r = $(a, r, "privateKey");
	var f, p = 0 | U._crypto_box_secretkeybytes();
	r.length !== p && Z(a, "invalid privateKey length"), f = J(r), a.push(f);
	var m = new q(0 | s), h = m.address;
	a.push(h);
	var g = new q(0 | U._crypto_box_macbytes()), _ = g.address;
	if (a.push(_), !(0 | U._crypto_box_detached(h, _, o, s, 0, c, u, f))) {
		var v = G({
			ciphertext: m,
			mac: g
		}, i);
		return Y(a), v;
	}
	X(a, "invalid usage");
}
function Uc(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "message")), s = e.length;
	a.push(o), t = $(a, t, "nonce");
	var c, l = 0 | U._crypto_box_noncebytes();
	t.length !== l && Z(a, "invalid nonce length"), c = J(t), a.push(c), n = $(a, n, "publicKey");
	var u, d = 0 | U._crypto_box_publickeybytes();
	n.length !== d && Z(a, "invalid publicKey length"), u = J(n), a.push(u), r = $(a, r, "privateKey");
	var f, p = 0 | U._crypto_box_secretkeybytes();
	r.length !== p && Z(a, "invalid privateKey length"), f = J(r), a.push(f);
	var m = new q(s + U._crypto_box_macbytes() | 0), h = m.address;
	if (a.push(h), !(0 | U._crypto_box_easy(h, o, s, 0, c, u, f))) {
		var g = G(m, i);
		return Y(a), g;
	}
	X(a, "invalid usage");
}
function Wc(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "message")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_box_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "sharedKey");
	var l, u = 0 | U._crypto_box_beforenmbytes();
	n.length !== u && Z(i, "invalid sharedKey length"), l = J(n), i.push(l);
	var d = new q(o + U._crypto_box_macbytes() | 0), f = d.address;
	if (i.push(f), !(0 | U._crypto_box_easy_afternm(f, a, o, 0, s, l))) {
		var p = G(d, r);
		return Y(i), p;
	}
	X(i, "invalid usage");
}
function Gc(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_box_publickeybytes()), r = n.address;
	t.push(r);
	var i = new q(0 | U._crypto_box_secretkeybytes()), a = i.address;
	if (t.push(a), !(0 | U._crypto_box_keypair(r, a))) {
		var o = {
			publicKey: G(n, e),
			privateKey: G(i, e),
			keyType: "x25519"
		};
		return Y(t), o;
	}
	X(t, "internal error");
}
function Kc(e, t, n, r, i, a) {
	var o = [];
	K(a);
	var s = J(e = $(o, e, "ciphertext")), c = e.length;
	o.push(s), t = $(o, t, "mac");
	var l, u = 0 | U._crypto_box_macbytes();
	t.length !== u && Z(o, "invalid mac length"), l = J(t), o.push(l), n = $(o, n, "nonce");
	var d, f = 0 | U._crypto_box_noncebytes();
	n.length !== f && Z(o, "invalid nonce length"), d = J(n), o.push(d), r = $(o, r, "publicKey");
	var p, m = 0 | U._crypto_box_publickeybytes();
	r.length !== m && Z(o, "invalid publicKey length"), p = J(r), o.push(p), i = $(o, i, "privateKey");
	var h, g = 0 | U._crypto_box_secretkeybytes();
	i.length !== g && Z(o, "invalid privateKey length"), h = J(i), o.push(h);
	var _ = new q(0 | c), v = _.address;
	if (o.push(v), !(0 | U._crypto_box_open_detached(v, s, l, c, 0, d, p, h))) {
		var y = G(_, a);
		return Y(o), y;
	}
	X(o, "incorrect key pair for the given ciphertext");
}
function qc(e, t, n, r, i) {
	var a = [];
	K(i), e = $(a, e, "ciphertext");
	var o, s = U._crypto_box_macbytes(), c = e.length;
	c < s && Z(a, "ciphertext is too short"), o = J(e), a.push(o), t = $(a, t, "nonce");
	var l, u = 0 | U._crypto_box_noncebytes();
	t.length !== u && Z(a, "invalid nonce length"), l = J(t), a.push(l), n = $(a, n, "publicKey");
	var d, f = 0 | U._crypto_box_publickeybytes();
	n.length !== f && Z(a, "invalid publicKey length"), d = J(n), a.push(d), r = $(a, r, "privateKey");
	var p, m = 0 | U._crypto_box_secretkeybytes();
	r.length !== m && Z(a, "invalid privateKey length"), p = J(r), a.push(p);
	var h = new q(c - U._crypto_box_macbytes() | 0), g = h.address;
	if (a.push(g), !(0 | U._crypto_box_open_easy(g, o, c, 0, l, d, p))) {
		var _ = G(h, i);
		return Y(a), _;
	}
	X(a, "incorrect key pair for the given ciphertext");
}
function Jc(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "ciphertext")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_box_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "sharedKey");
	var l, u = 0 | U._crypto_box_beforenmbytes();
	n.length !== u && Z(i, "invalid sharedKey length"), l = J(n), i.push(l);
	var d = new q(o - U._crypto_box_macbytes() | 0), f = d.address;
	if (i.push(f), !(0 | U._crypto_box_open_easy_afternm(f, a, o, 0, s, l))) {
		var p = G(d, r);
		return Y(i), p;
	}
	X(i, "incorrect secret key for the given ciphertext");
}
function Yc(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "publicKey");
	var o, s = 0 | U._crypto_box_publickeybytes();
	t.length !== s && Z(r, "invalid publicKey length"), o = J(t), r.push(o);
	var c = new q(a + U._crypto_box_sealbytes() | 0), l = c.address;
	if (r.push(l), !(0 | U._crypto_box_seal(l, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function Xc(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "ciphertext");
	var a, o = U._crypto_box_sealbytes(), s = e.length;
	s < o && Z(i, "ciphertext is too short"), a = J(e), i.push(a), t = $(i, t, "publicKey");
	var c, l = 0 | U._crypto_box_publickeybytes();
	t.length !== l && Z(i, "invalid publicKey length"), c = J(t), i.push(c), n = $(i, n, "privateKey");
	var u, d = 0 | U._crypto_box_secretkeybytes();
	n.length !== d && Z(i, "invalid privateKey length"), u = J(n), i.push(u);
	var f = new q(s - U._crypto_box_sealbytes() | 0), p = f.address;
	if (i.push(p), !(0 | U._crypto_box_seal_open(p, a, s, 0, c, u))) {
		var m = G(f, r);
		return Y(i), m;
	}
	X(i, "incorrect key pair for the given ciphertext");
}
function Zc(e, t) {
	var n = [];
	K(t), e = $(n, e, "seed");
	var r, i = 0 | U._crypto_box_seedbytes();
	e.length !== i && Z(n, "invalid seed length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_box_publickeybytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_box_secretkeybytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_box_seed_keypair(o, c, r))) {
		var l = {
			publicKey: G(a, t),
			privateKey: G(s, t),
			keyType: "x25519"
		};
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function Qc(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "p");
	var i, a = 0 | U._crypto_core_ed25519_bytes();
	e.length !== a && Z(r, "invalid p length"), i = J(e), r.push(i), t = $(r, t, "q");
	var o, s = 0 | U._crypto_core_ed25519_bytes();
	t.length !== s && Z(r, "invalid q length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ed25519_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_core_ed25519_add(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "input is an invalid element");
}
function $c(e, t) {
	var n = [];
	K(t);
	var r = J(e = $(n, e, "r"));
	e.length, n.push(r);
	var i = new q(0 | U._crypto_core_ed25519_bytes()), a = i.address;
	if (n.push(a), !(0 | U._crypto_core_ed25519_from_hash(a, r))) {
		var o = G(i, t);
		return Y(n), o;
	}
	X(n, "invalid usage");
}
function el(e, t) {
	var n = [];
	K(t);
	var r = J(e = $(n, e, "r"));
	e.length, n.push(r);
	var i = new q(0 | U._crypto_core_ed25519_bytes()), a = i.address;
	if (n.push(a), !(0 | U._crypto_core_ed25519_from_uniform(a, r))) {
		var o = G(i, t);
		return Y(n), o;
	}
	X(n, "invalid usage");
}
function tl(e, t) {
	var n = [];
	K(t), e = $(n, e, "repr");
	var r, i = 0 | U._crypto_core_ed25519_bytes();
	e.length !== i && Z(n, "invalid repr length"), r = J(e), n.push(r);
	var a = (0 | U._crypto_core_ed25519_is_valid_point(r)) == 1;
	return Y(n), a;
}
function nl(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_core_ed25519_bytes()), r = n.address;
	t.push(r), U._crypto_core_ed25519_random(r);
	var i = G(n, e);
	return Y(t), i;
}
function rl(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "x");
	var i, a = 0 | U._crypto_core_ed25519_scalarbytes();
	e.length !== a && Z(r, "invalid x length"), i = J(e), r.push(i), t = $(r, t, "y");
	var o, s = 0 | U._crypto_core_ed25519_scalarbytes();
	t.length !== s && Z(r, "invalid y length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ed25519_scalarbytes()), l = c.address;
	r.push(l), U._crypto_core_ed25519_scalar_add(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function il(e, t) {
	var n = [];
	K(t), e = $(n, e, "s");
	var r, i = 0 | U._crypto_core_ed25519_scalarbytes();
	e.length !== i && Z(n, "invalid s length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ed25519_scalarbytes()), o = a.address;
	n.push(o), U._crypto_core_ed25519_scalar_complement(o, r);
	var s = G(a, t);
	return Y(n), s;
}
function al(e, t) {
	var n = [];
	K(t), e = $(n, e, "s");
	var r, i = 0 | U._crypto_core_ed25519_scalarbytes();
	e.length !== i && Z(n, "invalid s length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ed25519_scalarbytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_core_ed25519_scalar_invert(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid reciprocate");
}
function ol(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "x");
	var i, a = 0 | U._crypto_core_ed25519_scalarbytes();
	e.length !== a && Z(r, "invalid x length"), i = J(e), r.push(i), t = $(r, t, "y");
	var o, s = 0 | U._crypto_core_ed25519_scalarbytes();
	t.length !== s && Z(r, "invalid y length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ed25519_scalarbytes()), l = c.address;
	r.push(l), U._crypto_core_ed25519_scalar_mul(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function sl(e, t) {
	var n = [];
	K(t), e = $(n, e, "s");
	var r, i = 0 | U._crypto_core_ed25519_scalarbytes();
	e.length !== i && Z(n, "invalid s length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ed25519_scalarbytes()), o = a.address;
	n.push(o), U._crypto_core_ed25519_scalar_negate(o, r);
	var s = G(a, t);
	return Y(n), s;
}
function cl(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_core_ed25519_scalarbytes()), r = n.address;
	t.push(r), U._crypto_core_ed25519_scalar_random(r);
	var i = G(n, e);
	return Y(t), i;
}
function ll(e, t) {
	var n = [];
	K(t), e = $(n, e, "sample");
	var r, i = 0 | U._crypto_core_ed25519_nonreducedscalarbytes();
	e.length !== i && Z(n, "invalid sample length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ed25519_scalarbytes()), o = a.address;
	n.push(o), U._crypto_core_ed25519_scalar_reduce(o, r);
	var s = G(a, t);
	return Y(n), s;
}
function ul(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "x");
	var i, a = 0 | U._crypto_core_ed25519_scalarbytes();
	e.length !== a && Z(r, "invalid x length"), i = J(e), r.push(i), t = $(r, t, "y");
	var o, s = 0 | U._crypto_core_ed25519_scalarbytes();
	t.length !== s && Z(r, "invalid y length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ed25519_scalarbytes()), l = c.address;
	r.push(l), U._crypto_core_ed25519_scalar_sub(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function dl(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "p");
	var i, a = 0 | U._crypto_core_ed25519_bytes();
	e.length !== a && Z(r, "invalid p length"), i = J(e), r.push(i), t = $(r, t, "q");
	var o, s = 0 | U._crypto_core_ed25519_bytes();
	t.length !== s && Z(r, "invalid q length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ed25519_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_core_ed25519_sub(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "input is an invalid element");
}
function fl(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "input");
	var a, o = 0 | U._crypto_core_hchacha20_inputbytes();
	e.length !== o && Z(i, "invalid input length"), a = J(e), i.push(a), t = $(i, t, "privateKey");
	var s, c = 0 | U._crypto_core_hchacha20_keybytes();
	t.length !== c && Z(i, "invalid privateKey length"), s = J(t), i.push(s);
	var l = null;
	n != null && (l = J(n = $(i, n, "constant")), n.length, i.push(l));
	var u = new q(0 | U._crypto_core_hchacha20_outputbytes()), d = u.address;
	if (i.push(d), !(0 | U._crypto_core_hchacha20(d, a, s, l))) {
		var f = G(u, r);
		return Y(i), f;
	}
	X(i, "invalid usage");
}
function pl(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "input");
	var a, o = 0 | U._crypto_core_hsalsa20_inputbytes();
	e.length !== o && Z(i, "invalid input length"), a = J(e), i.push(a), t = $(i, t, "privateKey");
	var s, c = 0 | U._crypto_core_hsalsa20_keybytes();
	t.length !== c && Z(i, "invalid privateKey length"), s = J(t), i.push(s);
	var l = null;
	n != null && (l = J(n = $(i, n, "constant")), n.length, i.push(l));
	var u = new q(0 | U._crypto_core_hsalsa20_outputbytes()), d = u.address;
	if (i.push(d), !(0 | U._crypto_core_hsalsa20(d, a, s, l))) {
		var f = G(u, r);
		return Y(i), f;
	}
	X(i, "invalid usage");
}
function ml(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "p");
	var i, a = 0 | U._crypto_core_ristretto255_bytes();
	e.length !== a && Z(r, "invalid p length"), i = J(e), r.push(i), t = $(r, t, "q");
	var o, s = 0 | U._crypto_core_ristretto255_bytes();
	t.length !== s && Z(r, "invalid q length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ristretto255_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_core_ristretto255_add(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "input is an invalid element");
}
function hl(e, t) {
	var n = [];
	K(t);
	var r = J(e = $(n, e, "r"));
	e.length, n.push(r);
	var i = new q(0 | U._crypto_core_ristretto255_bytes()), a = i.address;
	if (n.push(a), !(0 | U._crypto_core_ristretto255_from_hash(a, r))) {
		var o = G(i, t);
		return Y(n), o;
	}
	X(n, "invalid usage");
}
function gl(e, t) {
	var n = [];
	K(t), e = $(n, e, "repr");
	var r, i = 0 | U._crypto_core_ristretto255_bytes();
	e.length !== i && Z(n, "invalid repr length"), r = J(e), n.push(r);
	var a = (0 | U._crypto_core_ristretto255_is_valid_point(r)) == 1;
	return Y(n), a;
}
function _l(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_core_ristretto255_bytes()), r = n.address;
	t.push(r), U._crypto_core_ristretto255_random(r);
	var i = G(n, e);
	return Y(t), i;
}
function vl(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "x");
	var i, a = 0 | U._crypto_core_ristretto255_scalarbytes();
	e.length !== a && Z(r, "invalid x length"), i = J(e), r.push(i), t = $(r, t, "y");
	var o, s = 0 | U._crypto_core_ristretto255_scalarbytes();
	t.length !== s && Z(r, "invalid y length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ristretto255_scalarbytes()), l = c.address;
	r.push(l), U._crypto_core_ristretto255_scalar_add(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function yl(e, t) {
	var n = [];
	K(t), e = $(n, e, "s");
	var r, i = 0 | U._crypto_core_ristretto255_scalarbytes();
	e.length !== i && Z(n, "invalid s length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ristretto255_scalarbytes()), o = a.address;
	n.push(o), U._crypto_core_ristretto255_scalar_complement(o, r);
	var s = G(a, t);
	return Y(n), s;
}
function bl(e, t) {
	var n = [];
	K(t), e = $(n, e, "s");
	var r, i = 0 | U._crypto_core_ristretto255_scalarbytes();
	e.length !== i && Z(n, "invalid s length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ristretto255_scalarbytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_core_ristretto255_scalar_invert(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid reciprocate");
}
function xl(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "x");
	var i, a = 0 | U._crypto_core_ristretto255_scalarbytes();
	e.length !== a && Z(r, "invalid x length"), i = J(e), r.push(i), t = $(r, t, "y");
	var o, s = 0 | U._crypto_core_ristretto255_scalarbytes();
	t.length !== s && Z(r, "invalid y length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ristretto255_scalarbytes()), l = c.address;
	r.push(l), U._crypto_core_ristretto255_scalar_mul(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function Sl(e, t) {
	var n = [];
	K(t), e = $(n, e, "s");
	var r, i = 0 | U._crypto_core_ristretto255_scalarbytes();
	e.length !== i && Z(n, "invalid s length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ristretto255_scalarbytes()), o = a.address;
	n.push(o), U._crypto_core_ristretto255_scalar_negate(o, r);
	var s = G(a, t);
	return Y(n), s;
}
function Cl(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_core_ristretto255_scalarbytes()), r = n.address;
	t.push(r), U._crypto_core_ristretto255_scalar_random(r);
	var i = G(n, e);
	return Y(t), i;
}
function wl(e, t) {
	var n = [];
	K(t), e = $(n, e, "sample");
	var r, i = 0 | U._crypto_core_ristretto255_nonreducedscalarbytes();
	e.length !== i && Z(n, "invalid sample length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ristretto255_scalarbytes()), o = a.address;
	n.push(o), U._crypto_core_ristretto255_scalar_reduce(o, r);
	var s = G(a, t);
	return Y(n), s;
}
function Tl(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "x");
	var i, a = 0 | U._crypto_core_ristretto255_scalarbytes();
	e.length !== a && Z(r, "invalid x length"), i = J(e), r.push(i), t = $(r, t, "y");
	var o, s = 0 | U._crypto_core_ristretto255_scalarbytes();
	t.length !== s && Z(r, "invalid y length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ristretto255_scalarbytes()), l = c.address;
	r.push(l), U._crypto_core_ristretto255_scalar_sub(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function El(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "p");
	var i, a = 0 | U._crypto_core_ristretto255_bytes();
	e.length !== a && Z(r, "invalid p length"), i = J(e), r.push(i), t = $(r, t, "q");
	var o, s = 0 | U._crypto_core_ristretto255_bytes();
	t.length !== s && Z(r, "invalid q length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_core_ristretto255_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_core_ristretto255_sub(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "input is an invalid element");
}
function Dl(e, t, n, r) {
	var i = [];
	K(r), Q(i, e, "hash_length"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(i, "hash_length must be an unsigned integer");
	var a = J(t = $(i, t, "message")), o = t.length;
	i.push(a);
	var s = null, c = 0;
	n != null && (s = J(n = $(i, n, "key")), c = n.length, i.push(s));
	var l = new q(e |= 0), u = l.address;
	if (i.push(u), !(0 | U._crypto_generichash(u, e, a, o, 0, s, c))) {
		var d = G(l, r);
		return Y(i), d;
	}
	X(i, "invalid usage");
}
function Ol(e, t, n, r, i) {
	var a = [];
	K(i), Q(a, e, "subkey_len"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(a, "subkey_len must be an unsigned integer");
	var o = null, s = 0;
	t != null && (o = J(t = $(a, t, "key")), s = t.length, a.push(o));
	var c = null, l = 0;
	n != null && (n = $(a, n, "id"), l = 0 | U._crypto_generichash_blake2b_saltbytes(), n.length !== l && Z(a, "invalid id length"), c = J(n), a.push(c));
	var u = null, d = 0;
	r != null && (r = $(a, r, "ctx"), d = 0 | U._crypto_generichash_blake2b_personalbytes(), r.length !== d && Z(a, "invalid ctx length"), u = J(r), a.push(u));
	var f = new q(0 | e), p = f.address;
	if (a.push(p), !(0 | U._crypto_generichash_blake2b_salt_personal(p, e, null, 0, 0, o, s, c, u))) {
		var m = G(f, i);
		return Y(a), m;
	}
	X(a, "invalid usage");
}
function kl(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address"), Q(r, t, "hash_length"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(r, "hash_length must be an unsigned integer");
	var i = new q(t |= 0), a = i.address;
	if (r.push(a), !(0 | U._crypto_generichash_final(e, a, t))) {
		var o = (U._free(e), G(i, n));
		return Y(r), o;
	}
	X(r, "invalid usage");
}
function Al(e, t, n) {
	var r = [];
	K(n);
	var i = null, a = 0;
	e != null && (i = J(e = $(r, e, "key")), a = e.length, r.push(i)), Q(r, t, "hash_length"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(r, "hash_length must be an unsigned integer");
	var o = new q(357).address;
	if (!(0 | U._crypto_generichash_init(o, i, a, t))) {
		var s = o;
		return Y(r), s;
	}
	X(r, "invalid usage");
}
function jl(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_generichash_keybytes()), r = n.address;
	t.push(r), U._crypto_generichash_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function Ml(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_generichash_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function Nl(e, t) {
	var n = [];
	K(t);
	var r = J(e = $(n, e, "message")), i = e.length;
	n.push(r);
	var a = new q(0 | U._crypto_hash_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_hash(o, r, i, 0))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid usage");
}
function Pl(e, t) {
	var n = [];
	K(t);
	var r = J(e = $(n, e, "message")), i = e.length;
	n.push(r);
	var a = new q(0 | U._crypto_hash_sha256_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_hash_sha256(o, r, i, 0))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid usage");
}
function Fl(e, t) {
	var n = [];
	K(t), Q(n, e, "state_address");
	var r = new q(0 | U._crypto_hash_sha256_bytes()), i = r.address;
	if (n.push(i), !(0 | U._crypto_hash_sha256_final(e, i))) {
		var a = (U._free(e), G(r, t));
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function Il(e) {
	var t = [];
	K(e);
	var n = new q(104).address;
	if (!(0 | U._crypto_hash_sha256_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "invalid usage");
}
function Ll(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_hash_sha256_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function Rl(e, t) {
	var n = [];
	K(t);
	var r = J(e = $(n, e, "message")), i = e.length;
	n.push(r);
	var a = new q(0 | U._crypto_hash_sha3256_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_hash_sha3256(o, r, i))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid usage");
}
function zl(e, t) {
	var n = [];
	K(t), Q(n, e, "state_address");
	var r = new q(0 | U._crypto_hash_sha3256_bytes()), i = r.address;
	if (n.push(i), !(0 | U._crypto_hash_sha3256_final(e, i))) {
		var a = (U._free(e), G(r, t));
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function Bl(e) {
	var t = [];
	K(e);
	var n = new q(256).address;
	if (!(0 | U._crypto_hash_sha3256_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "invalid usage");
}
function Vl(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_hash_sha3256_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function Hl(e, t) {
	var n = [];
	K(t);
	var r = J(e = $(n, e, "message")), i = e.length;
	n.push(r);
	var a = new q(0 | U._crypto_hash_sha3512_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_hash_sha3512(o, r, i))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid usage");
}
function Ul(e, t) {
	var n = [];
	K(t), Q(n, e, "state_address");
	var r = new q(0 | U._crypto_hash_sha3512_bytes()), i = r.address;
	if (n.push(i), !(0 | U._crypto_hash_sha3512_final(e, i))) {
		var a = (U._free(e), G(r, t));
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function Wl(e) {
	var t = [];
	K(e);
	var n = new q(256).address;
	if (!(0 | U._crypto_hash_sha3512_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "invalid usage");
}
function Gl(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_hash_sha3512_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function Kl(e, t) {
	var n = [];
	K(t);
	var r = J(e = $(n, e, "message")), i = e.length;
	n.push(r);
	var a = new q(0 | U._crypto_hash_sha512_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_hash_sha512(o, r, i, 0))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid usage");
}
function ql(e, t) {
	var n = [];
	K(t), Q(n, e, "state_address");
	var r = new q(0 | U._crypto_hash_sha512_bytes()), i = r.address;
	if (n.push(i), !(0 | U._crypto_hash_sha512_final(e, i))) {
		var a = (U._free(e), G(r, t));
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function Jl(e) {
	var t = [];
	K(e);
	var n = new q(208).address;
	if (!(0 | U._crypto_hash_sha512_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "invalid usage");
}
function Yl(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_hash_sha512_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function Xl(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "input");
	var i, a = 0 | U._crypto_ipcrypt_bytes();
	e.length !== a && Z(r, "invalid input length"), i = J(e), r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_ipcrypt_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_ipcrypt_bytes()), l = c.address;
	r.push(l), U._crypto_ipcrypt_decrypt(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function Zl(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "input");
	var i, a = 0 | U._crypto_ipcrypt_bytes();
	e.length !== a && Z(r, "invalid input length"), i = J(e), r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_ipcrypt_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_ipcrypt_bytes()), l = c.address;
	r.push(l), U._crypto_ipcrypt_encrypt(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function Ql(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_ipcrypt_keybytes()), r = n.address;
	t.push(r), U._crypto_ipcrypt_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function $l(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "input");
	var i, a = 0 | U._crypto_ipcrypt_nd_outputbytes();
	e.length !== a && Z(r, "invalid input length"), i = J(e), r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_ipcrypt_nd_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_ipcrypt_nd_inputbytes()), l = c.address;
	r.push(l), U._crypto_ipcrypt_nd_decrypt(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function eu(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "input");
	var a, o = 0 | U._crypto_ipcrypt_nd_inputbytes();
	e.length !== o && Z(i, "invalid input length"), a = J(e), i.push(a), t = $(i, t, "tweak");
	var s, c = 0 | U._crypto_ipcrypt_nd_tweakbytes();
	t.length !== c && Z(i, "invalid tweak length"), s = J(t), i.push(s), n = $(i, n, "key");
	var l, u = 0 | U._crypto_ipcrypt_nd_keybytes();
	n.length !== u && Z(i, "invalid key length"), l = J(n), i.push(l);
	var d = new q(0 | U._crypto_ipcrypt_nd_outputbytes()), f = d.address;
	i.push(f), U._crypto_ipcrypt_nd_encrypt(f, a, s, l);
	var p = G(d, r);
	return Y(i), p;
}
function tu(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_ipcrypt_nd_keybytes()), r = n.address;
	t.push(r), U._crypto_ipcrypt_nd_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function nu(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "input");
	var i, a = 0 | U._crypto_ipcrypt_ndx_outputbytes();
	e.length !== a && Z(r, "invalid input length"), i = J(e), r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_ipcrypt_ndx_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_ipcrypt_ndx_inputbytes()), l = c.address;
	r.push(l), U._crypto_ipcrypt_ndx_decrypt(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function ru(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "input");
	var a, o = 0 | U._crypto_ipcrypt_ndx_inputbytes();
	e.length !== o && Z(i, "invalid input length"), a = J(e), i.push(a), t = $(i, t, "tweak");
	var s, c = 0 | U._crypto_ipcrypt_ndx_tweakbytes();
	t.length !== c && Z(i, "invalid tweak length"), s = J(t), i.push(s), n = $(i, n, "key");
	var l, u = 0 | U._crypto_ipcrypt_ndx_keybytes();
	n.length !== u && Z(i, "invalid key length"), l = J(n), i.push(l);
	var d = new q(0 | U._crypto_ipcrypt_ndx_outputbytes()), f = d.address;
	i.push(f), U._crypto_ipcrypt_ndx_encrypt(f, a, s, l);
	var p = G(d, r);
	return Y(i), p;
}
function iu(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_ipcrypt_ndx_keybytes()), r = n.address;
	t.push(r), U._crypto_ipcrypt_ndx_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function au(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "input");
	var i, a = 0 | U._crypto_ipcrypt_pfx_bytes();
	e.length !== a && Z(r, "invalid input length"), i = J(e), r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_ipcrypt_pfx_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_ipcrypt_pfx_bytes()), l = c.address;
	r.push(l), U._crypto_ipcrypt_pfx_decrypt(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function ou(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "input");
	var i, a = 0 | U._crypto_ipcrypt_pfx_bytes();
	e.length !== a && Z(r, "invalid input length"), i = J(e), r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_ipcrypt_pfx_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_ipcrypt_pfx_bytes()), l = c.address;
	r.push(l), U._crypto_ipcrypt_pfx_encrypt(l, i, o);
	var u = G(c, n);
	return Y(r), u;
}
function su(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_ipcrypt_pfx_keybytes()), r = n.address;
	t.push(r), U._crypto_ipcrypt_pfx_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function cu(e, t, n, r, i) {
	var a = [];
	K(i), Q(a, e, "subkey_len"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(a, "subkey_len must be an unsigned integer"), Q(a, t, "subkey_id");
	var o, s = 0;
	if (typeof t == "bigint" && t >= BigInt(0)) {
		let e = t >> BigInt(32);
		e > BigInt(4294967295) && Z(a, "subkey_id cannot be more than 64 bits"), s = Number(e), o = Number(t & BigInt(4294967295));
	} else typeof t == "number" && (0 | t) === t && t >= 0 ? o = t : Z(a, "subkey_id must be an unsigned integer or bigint");
	typeof n != "string" && Z(a, "ctx must be a string"), (n = ws(n + "\0")).length - 1 !== U._crypto_kdf_contextbytes() && Z(a, "invalid ctx length");
	var c = J(n);
	n.length, a.push(c), r = $(a, r, "key");
	var l, u = 0 | U._crypto_kdf_keybytes();
	r.length !== u && Z(a, "invalid key length"), l = J(r), a.push(l);
	var d = new q(0 | e), f = d.address;
	a.push(f), U._crypto_kdf_derive_from_key(f, e, o, s, c, l);
	var p = G(d, i);
	return Y(a), p;
}
function lu(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_kdf_keybytes()), r = n.address;
	t.push(r), U._crypto_kdf_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function uu(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "ciphertext");
	var i, a = 0 | U._crypto_kem_ciphertextbytes();
	e.length !== a && Z(r, "invalid ciphertext length"), i = J(e), r.push(i), t = $(r, t, "privateKey");
	var o, s = 0 | U._crypto_kem_secretkeybytes();
	t.length !== s && Z(r, "invalid privateKey length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_kem_sharedsecretbytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_kem_dec(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function du(e, t) {
	var n = [];
	K(t), e = $(n, e, "publicKey");
	var r, i = 0 | U._crypto_kem_publickeybytes();
	e.length !== i && Z(n, "invalid publicKey length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_kem_ciphertextbytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_kem_sharedsecretbytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_kem_enc(o, c, r))) {
		var l = G({
			ciphertext: a,
			sharedSecret: s
		}, t);
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function fu(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_kem_publickeybytes()), r = n.address;
	t.push(r);
	var i = new q(0 | U._crypto_kem_secretkeybytes()), a = i.address;
	if (t.push(a), !(0 | U._crypto_kem_keypair(r, a))) {
		var o = {
			publicKey: G(n, e),
			privateKey: G(i, e),
			keyType: "xwing"
		};
		return Y(t), o;
	}
	X(t, "internal error");
}
function pu(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "ciphertext");
	var i, a = 0 | U._crypto_kem_mlkem768_ciphertextbytes();
	e.length !== a && Z(r, "invalid ciphertext length"), i = J(e), r.push(i), t = $(r, t, "privateKey");
	var o, s = 0 | U._crypto_kem_mlkem768_secretkeybytes();
	t.length !== s && Z(r, "invalid privateKey length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_kem_mlkem768_sharedsecretbytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_kem_mlkem768_dec(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function mu(e, t) {
	var n = [];
	K(t), e = $(n, e, "publicKey");
	var r, i = 0 | U._crypto_kem_mlkem768_publickeybytes();
	e.length !== i && Z(n, "invalid publicKey length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_kem_mlkem768_ciphertextbytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_kem_mlkem768_sharedsecretbytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_kem_mlkem768_enc(o, c, r))) {
		var l = G({
			ciphertext: a,
			sharedSecret: s
		}, t);
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function hu(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "publicKey");
	var i, a, o = 0 | U._crypto_kem_mlkem768_publickeybytes();
	e.length !== o && Z(r, "invalid publicKey length"), i = J(e), r.push(i), (t = $(r, t, "seed")).length !== 32 && Z(r, "invalid seed length"), a = J(t), r.push(a);
	var s = new q(0 | U._crypto_kem_mlkem768_ciphertextbytes()), c = s.address;
	r.push(c);
	var l = new q(0 | U._crypto_kem_mlkem768_sharedsecretbytes()), u = l.address;
	if (r.push(u), !(0 | U._crypto_kem_mlkem768_enc_deterministic(c, u, i, a))) {
		var d = G({
			ciphertext: s,
			sharedSecret: l
		}, n);
		return Y(r), d;
	}
	X(r, "invalid usage");
}
function gu(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_kem_mlkem768_publickeybytes()), r = n.address;
	t.push(r);
	var i = new q(0 | U._crypto_kem_mlkem768_secretkeybytes()), a = i.address;
	if (t.push(a), !(0 | U._crypto_kem_mlkem768_keypair(r, a))) {
		var o = {
			publicKey: G(n, e),
			privateKey: G(i, e),
			keyType: "ml-kem-768"
		};
		return Y(t), o;
	}
	X(t, "internal error");
}
function _u(e, t) {
	var n = [];
	K(t), e = $(n, e, "seed");
	var r, i = 0 | U._crypto_kem_mlkem768_seedbytes();
	e.length !== i && Z(n, "invalid seed length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_kem_mlkem768_publickeybytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_kem_mlkem768_secretkeybytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_kem_mlkem768_seed_keypair(o, c, r))) {
		var l = {
			publicKey: G(a, t),
			privateKey: G(s, t),
			keyType: "ml-kem-768"
		};
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function vu() {
	var e = U._crypto_kem_primitive(), t = U.UTF8ToString(e);
	return Y([]), t;
}
function yu(e, t) {
	var n = [];
	K(t), e = $(n, e, "seed");
	var r, i = 0 | U._crypto_kem_seedbytes();
	e.length !== i && Z(n, "invalid seed length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_kem_publickeybytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_kem_secretkeybytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_kem_seed_keypair(o, c, r))) {
		var l = {
			publicKey: G(a, t),
			privateKey: G(s, t),
			keyType: "xwing"
		};
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function bu(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "ciphertext");
	var i, a = 0 | U._crypto_kem_xwing_ciphertextbytes();
	e.length !== a && Z(r, "invalid ciphertext length"), i = J(e), r.push(i), t = $(r, t, "privateKey");
	var o, s = 0 | U._crypto_kem_xwing_secretkeybytes();
	t.length !== s && Z(r, "invalid privateKey length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_kem_xwing_sharedsecretbytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_kem_xwing_dec(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function xu(e, t) {
	var n = [];
	K(t), e = $(n, e, "publicKey");
	var r, i = 0 | U._crypto_kem_xwing_publickeybytes();
	e.length !== i && Z(n, "invalid publicKey length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_kem_xwing_ciphertextbytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_kem_xwing_sharedsecretbytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_kem_xwing_enc(o, c, r))) {
		var l = G({
			ciphertext: a,
			sharedSecret: s
		}, t);
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function Su(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "publicKey");
	var i, a, o = 0 | U._crypto_kem_xwing_publickeybytes();
	e.length !== o && Z(r, "invalid publicKey length"), i = J(e), r.push(i), (t = $(r, t, "seed")).length !== 64 && Z(r, "invalid seed length"), a = J(t), r.push(a);
	var s = new q(0 | U._crypto_kem_xwing_ciphertextbytes()), c = s.address;
	r.push(c);
	var l = new q(0 | U._crypto_kem_xwing_sharedsecretbytes()), u = l.address;
	if (r.push(u), !(0 | U._crypto_kem_xwing_enc_deterministic(c, u, i, a))) {
		var d = G({
			ciphertext: s,
			sharedSecret: l
		}, n);
		return Y(r), d;
	}
	X(r, "invalid usage");
}
function Cu(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_kem_xwing_publickeybytes()), r = n.address;
	t.push(r);
	var i = new q(0 | U._crypto_kem_xwing_secretkeybytes()), a = i.address;
	if (t.push(a), !(0 | U._crypto_kem_xwing_keypair(r, a))) {
		var o = {
			publicKey: G(n, e),
			privateKey: G(i, e),
			keyType: "xwing"
		};
		return Y(t), o;
	}
	X(t, "internal error");
}
function wu(e, t) {
	var n = [];
	K(t), e = $(n, e, "seed");
	var r, i = 0 | U._crypto_kem_xwing_seedbytes();
	e.length !== i && Z(n, "invalid seed length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_kem_xwing_publickeybytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_kem_xwing_secretkeybytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_kem_xwing_seed_keypair(o, c, r))) {
		var l = {
			publicKey: G(a, t),
			privateKey: G(s, t),
			keyType: "xwing"
		};
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function Tu(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "clientPublicKey");
	var a, o = 0 | U._crypto_kx_publickeybytes();
	e.length !== o && Z(i, "invalid clientPublicKey length"), a = J(e), i.push(a), t = $(i, t, "clientSecretKey");
	var s, c = 0 | U._crypto_kx_secretkeybytes();
	t.length !== c && Z(i, "invalid clientSecretKey length"), s = J(t), i.push(s), n = $(i, n, "serverPublicKey");
	var l, u = 0 | U._crypto_kx_publickeybytes();
	n.length !== u && Z(i, "invalid serverPublicKey length"), l = J(n), i.push(l);
	var d = new q(0 | U._crypto_kx_sessionkeybytes()), f = d.address;
	i.push(f);
	var p = new q(0 | U._crypto_kx_sessionkeybytes()), m = p.address;
	if (i.push(m), !(0 | U._crypto_kx_client_session_keys(f, m, a, s, l))) {
		var h = G({
			sharedRx: d,
			sharedTx: p
		}, r);
		return Y(i), h;
	}
	X(i, "invalid usage");
}
function Eu(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_kx_publickeybytes()), r = n.address;
	t.push(r);
	var i = new q(0 | U._crypto_kx_secretkeybytes()), a = i.address;
	if (t.push(a), !(0 | U._crypto_kx_keypair(r, a))) {
		var o = {
			publicKey: G(n, e),
			privateKey: G(i, e),
			keyType: "x25519"
		};
		return Y(t), o;
	}
	X(t, "internal error");
}
function Du(e, t) {
	var n = [];
	K(t), e = $(n, e, "seed");
	var r, i = 0 | U._crypto_kx_seedbytes();
	e.length !== i && Z(n, "invalid seed length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_kx_publickeybytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_kx_secretkeybytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_kx_seed_keypair(o, c, r))) {
		var l = {
			publicKey: G(a, t),
			privateKey: G(s, t),
			keyType: "x25519"
		};
		return Y(n), l;
	}
	X(n, "internal error");
}
function Ou(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "serverPublicKey");
	var a, o = 0 | U._crypto_kx_publickeybytes();
	e.length !== o && Z(i, "invalid serverPublicKey length"), a = J(e), i.push(a), t = $(i, t, "serverSecretKey");
	var s, c = 0 | U._crypto_kx_secretkeybytes();
	t.length !== c && Z(i, "invalid serverSecretKey length"), s = J(t), i.push(s), n = $(i, n, "clientPublicKey");
	var l, u = 0 | U._crypto_kx_publickeybytes();
	n.length !== u && Z(i, "invalid clientPublicKey length"), l = J(n), i.push(l);
	var d = new q(0 | U._crypto_kx_sessionkeybytes()), f = d.address;
	i.push(f);
	var p = new q(0 | U._crypto_kx_sessionkeybytes()), m = p.address;
	if (i.push(m), !(0 | U._crypto_kx_server_session_keys(f, m, a, s, l))) {
		var h = G({
			sharedRx: d,
			sharedTx: p
		}, r);
		return Y(i), h;
	}
	X(i, "invalid usage");
}
function ku(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_onetimeauth_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_onetimeauth_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_onetimeauth(l, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function Au(e, t) {
	var n = [];
	K(t), Q(n, e, "state_address");
	var r = new q(0 | U._crypto_onetimeauth_bytes()), i = r.address;
	if (n.push(i), !(0 | U._crypto_onetimeauth_final(e, i))) {
		var a = (U._free(e), G(r, t));
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function ju(e, t) {
	var n = [];
	K(t);
	var r = null;
	e != null && (r = J(e = $(n, e, "key")), e.length, n.push(r));
	var i = new q(144).address;
	if (!(0 | U._crypto_onetimeauth_init(i, r))) {
		var a = i;
		return Y(n), a;
	}
	X(n, "invalid usage");
}
function Mu(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_onetimeauth_keybytes()), r = n.address;
	t.push(r), U._crypto_onetimeauth_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function Nu(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_onetimeauth_update(e, i, a) && X(r, "invalid usage"), Y(r);
}
function Pu(e, t, n) {
	var r = [];
	e = $(r, e, "hash");
	var i, a = 0 | U._crypto_onetimeauth_bytes();
	e.length !== a && Z(r, "invalid hash length"), i = J(e), r.push(i);
	var o = J(t = $(r, t, "message")), s = t.length;
	r.push(o), n = $(r, n, "key");
	var c, l = 0 | U._crypto_onetimeauth_keybytes();
	n.length !== l && Z(r, "invalid key length"), c = J(n), r.push(c);
	var u = !(0 | U._crypto_onetimeauth_verify(i, o, s, 0, c));
	return Y(r), u;
}
function Fu(e, t, n, r, i, a, o) {
	var s = [];
	K(o), Q(s, e, "keyLength"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(s, "keyLength must be an unsigned integer");
	var c = J(t = $(s, t, "password")), l = t.length;
	s.push(c), n = $(s, n, "salt");
	var u, d = 0 | U._crypto_pwhash_saltbytes();
	n.length !== d && Z(s, "invalid salt length"), u = J(n), s.push(u), Q(s, r, "opsLimit"), (typeof r != "number" || (0 | r) !== r || r < 0) && Z(s, "opsLimit must be an unsigned integer"), Q(s, i, "memLimit"), (typeof i != "number" || (0 | i) !== i || i < 0) && Z(s, "memLimit must be an unsigned integer"), Q(s, a, "algorithm"), (typeof a != "number" || (0 | a) !== a || a < 0) && Z(s, "algorithm must be an unsigned integer");
	var f = new q(0 | e), p = f.address;
	if (s.push(p), !(0 | U._crypto_pwhash(p, e, 0, c, l, 0, u, r, 0, i, a))) {
		var m = G(f, o);
		return Y(s), m;
	}
	X(s, "invalid usage");
}
function Iu(e, t, n, r, i, a) {
	var o = [];
	K(a), Q(o, e, "keyLength"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(o, "keyLength must be an unsigned integer");
	var s = J(t = $(o, t, "password")), c = t.length;
	o.push(s), n = $(o, n, "salt");
	var l, u = 0 | U._crypto_pwhash_scryptsalsa208sha256_saltbytes();
	n.length !== u && Z(o, "invalid salt length"), l = J(n), o.push(l), Q(o, r, "opsLimit"), (typeof r != "number" || (0 | r) !== r || r < 0) && Z(o, "opsLimit must be an unsigned integer"), Q(o, i, "memLimit"), (typeof i != "number" || (0 | i) !== i || i < 0) && Z(o, "memLimit must be an unsigned integer");
	var d = new q(0 | e), f = d.address;
	if (o.push(f), !(0 | U._crypto_pwhash_scryptsalsa208sha256(f, e, 0, s, c, 0, l, r, 0, i))) {
		var p = G(d, a);
		return Y(o), p;
	}
	X(o, "invalid usage");
}
function Lu(e, t, n, r, i, a, o) {
	var s = [];
	K(o);
	var c = J(e = $(s, e, "password")), l = e.length;
	s.push(c);
	var u = J(t = $(s, t, "salt")), d = t.length;
	s.push(u), Q(s, n, "opsLimit"), (typeof n != "number" || (0 | n) !== n || n < 0) && Z(s, "opsLimit must be an unsigned integer"), Q(s, r, "r"), (typeof r != "number" || (0 | r) !== r || r < 0) && Z(s, "r must be an unsigned integer"), Q(s, i, "p"), (typeof i != "number" || (0 | i) !== i || i < 0) && Z(s, "p must be an unsigned integer"), Q(s, a, "keyLength"), (typeof a != "number" || (0 | a) !== a || a < 0) && Z(s, "keyLength must be an unsigned integer");
	var f = new q(0 | a), p = f.address;
	if (s.push(p), !(0 | U._crypto_pwhash_scryptsalsa208sha256_ll(c, l, u, d, n, 0, r, i, p, a))) {
		var m = G(f, o);
		return Y(s), m;
	}
	X(s, "invalid usage");
}
function Ru(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "password")), o = e.length;
	i.push(a), Q(i, t, "opsLimit"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(i, "opsLimit must be an unsigned integer"), Q(i, n, "memLimit"), (typeof n != "number" || (0 | n) !== n || n < 0) && Z(i, "memLimit must be an unsigned integer");
	var s = new q(0 | U._crypto_pwhash_scryptsalsa208sha256_strbytes()).address;
	if (i.push(s), !(0 | U._crypto_pwhash_scryptsalsa208sha256_str(s, a, o, 0, t, 0, n))) {
		var c = U.UTF8ToString(s);
		return Y(i), c;
	}
	X(i, "invalid usage");
}
function zu(e, t, n) {
	var r = [];
	K(n), typeof e != "string" && Z(r, "hashed_password must be a string");
	var i = J(e = ws(e + "\0"));
	e.length, r.push(i);
	var a = J(t = $(r, t, "password")), o = t.length;
	r.push(a);
	var s = !(0 | U._crypto_pwhash_scryptsalsa208sha256_str_verify(i, a, o, 0));
	return Y(r), s;
}
function Bu(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "password")), o = e.length;
	i.push(a), Q(i, t, "opsLimit"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(i, "opsLimit must be an unsigned integer"), Q(i, n, "memLimit"), (typeof n != "number" || (0 | n) !== n || n < 0) && Z(i, "memLimit must be an unsigned integer");
	var s = new q(0 | U._crypto_pwhash_strbytes()).address;
	if (i.push(s), !(0 | U._crypto_pwhash_str(s, a, o, 0, t, 0, n))) {
		var c = U.UTF8ToString(s);
		return Y(i), c;
	}
	X(i, "invalid usage");
}
function Vu(e, t, n, r) {
	var i = [];
	K(r), typeof e != "string" && Z(i, "hashed_password must be a string");
	var a = J(e = ws(e + "\0"));
	e.length, i.push(a), Q(i, t, "opsLimit"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(i, "opsLimit must be an unsigned integer"), Q(i, n, "memLimit"), (typeof n != "number" || (0 | n) !== n || n < 0) && Z(i, "memLimit must be an unsigned integer");
	var o = !!(0 | U._crypto_pwhash_str_needs_rehash(a, t, 0, n));
	return Y(i), o;
}
function Hu(e, t, n) {
	var r = [];
	K(n), typeof e != "string" && Z(r, "hashed_password must be a string");
	var i = J(e = ws(e + "\0"));
	e.length, r.push(i);
	var a = J(t = $(r, t, "password")), o = t.length;
	r.push(a);
	var s = !(0 | U._crypto_pwhash_str_verify(i, a, o, 0));
	return Y(r), s;
}
function Uu(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "privateKey");
	var i, a = 0 | U._crypto_scalarmult_scalarbytes();
	e.length !== a && Z(r, "invalid privateKey length"), i = J(e), r.push(i), t = $(r, t, "publicKey");
	var o, s = 0 | U._crypto_scalarmult_bytes();
	t.length !== s && Z(r, "invalid publicKey length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_scalarmult_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_scalarmult(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "weak public key");
}
function Wu(e, t) {
	var n = [];
	K(t), e = $(n, e, "privateKey");
	var r, i = 0 | U._crypto_scalarmult_scalarbytes();
	e.length !== i && Z(n, "invalid privateKey length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_scalarmult_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_scalarmult_base(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "unknown error");
}
function Gu(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "n");
	var i, a = 0 | U._crypto_scalarmult_ed25519_scalarbytes();
	e.length !== a && Z(r, "invalid n length"), i = J(e), r.push(i), t = $(r, t, "p");
	var o, s = 0 | U._crypto_scalarmult_ed25519_bytes();
	t.length !== s && Z(r, "invalid p length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_scalarmult_ed25519_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_scalarmult_ed25519(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid point or scalar is 0");
}
function Ku(e, t) {
	var n = [];
	K(t), e = $(n, e, "scalar");
	var r, i = 0 | U._crypto_scalarmult_ed25519_scalarbytes();
	e.length !== i && Z(n, "invalid scalar length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_scalarmult_ed25519_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_scalarmult_ed25519_base(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "scalar is 0");
}
function qu(e, t) {
	var n = [];
	K(t), e = $(n, e, "scalar");
	var r, i = 0 | U._crypto_scalarmult_ed25519_scalarbytes();
	e.length !== i && Z(n, "invalid scalar length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_scalarmult_ed25519_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_scalarmult_ed25519_base_noclamp(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "scalar is 0");
}
function Ju(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "n");
	var i, a = 0 | U._crypto_scalarmult_ed25519_scalarbytes();
	e.length !== a && Z(r, "invalid n length"), i = J(e), r.push(i), t = $(r, t, "p");
	var o, s = 0 | U._crypto_scalarmult_ed25519_bytes();
	t.length !== s && Z(r, "invalid p length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_scalarmult_ed25519_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_scalarmult_ed25519_noclamp(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid point or scalar is 0");
}
function Yu(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "scalar");
	var i, a = 0 | U._crypto_scalarmult_ristretto255_scalarbytes();
	e.length !== a && Z(r, "invalid scalar length"), i = J(e), r.push(i), t = $(r, t, "element");
	var o, s = 0 | U._crypto_scalarmult_ristretto255_bytes();
	t.length !== s && Z(r, "invalid element length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_scalarmult_ristretto255_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_scalarmult_ristretto255(l, i, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "result is identity element");
}
function Xu(e, t) {
	var n = [];
	K(t), e = $(n, e, "scalar");
	var r, i = 0 | U._crypto_core_ristretto255_scalarbytes();
	e.length !== i && Z(n, "invalid scalar length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_core_ristretto255_bytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_scalarmult_ristretto255_base(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "scalar is 0");
}
function Zu(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "message")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_secretbox_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "key");
	var l, u = 0 | U._crypto_secretbox_keybytes();
	n.length !== u && Z(i, "invalid key length"), l = J(n), i.push(l);
	var d = new q(0 | o), f = d.address;
	i.push(f);
	var p = new q(0 | U._crypto_secretbox_macbytes()), m = p.address;
	if (i.push(m), !(0 | U._crypto_secretbox_detached(f, m, a, o, 0, s, l))) {
		var h = G({
			mac: p,
			cipher: d
		}, r);
		return Y(i), h;
	}
	X(i, "invalid usage");
}
function Qu(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "message")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_secretbox_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "key");
	var l, u = 0 | U._crypto_secretbox_keybytes();
	n.length !== u && Z(i, "invalid key length"), l = J(n), i.push(l);
	var d = new q(o + U._crypto_secretbox_macbytes() | 0), f = d.address;
	if (i.push(f), !(0 | U._crypto_secretbox_easy(f, a, o, 0, s, l))) {
		var p = G(d, r);
		return Y(i), p;
	}
	X(i, "invalid usage");
}
function $u(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_secretbox_keybytes()), r = n.address;
	t.push(r), U._crypto_secretbox_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function ed(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "ciphertext")), s = e.length;
	a.push(o), t = $(a, t, "mac");
	var c, l = 0 | U._crypto_secretbox_macbytes();
	t.length !== l && Z(a, "invalid mac length"), c = J(t), a.push(c), n = $(a, n, "nonce");
	var u, d = 0 | U._crypto_secretbox_noncebytes();
	n.length !== d && Z(a, "invalid nonce length"), u = J(n), a.push(u), r = $(a, r, "key");
	var f, p = 0 | U._crypto_secretbox_keybytes();
	r.length !== p && Z(a, "invalid key length"), f = J(r), a.push(f);
	var m = new q(0 | s), h = m.address;
	if (a.push(h), !(0 | U._crypto_secretbox_open_detached(h, o, c, s, 0, u, f))) {
		var g = G(m, i);
		return Y(a), g;
	}
	X(a, "wrong secret key for the given ciphertext");
}
function td(e, t, n, r) {
	var i = [];
	K(r), e = $(i, e, "ciphertext");
	var a, o = U._crypto_secretbox_macbytes(), s = e.length;
	s < o && Z(i, "ciphertext is too short"), a = J(e), i.push(a), t = $(i, t, "nonce");
	var c, l = 0 | U._crypto_secretbox_noncebytes();
	t.length !== l && Z(i, "invalid nonce length"), c = J(t), i.push(c), n = $(i, n, "key");
	var u, d = 0 | U._crypto_secretbox_keybytes();
	n.length !== d && Z(i, "invalid key length"), u = J(n), i.push(u);
	var f = new q(s - U._crypto_secretbox_macbytes() | 0), p = f.address;
	if (i.push(p), !(0 | U._crypto_secretbox_open_easy(p, a, s, 0, c, u))) {
		var m = G(f, r);
		return Y(i), m;
	}
	X(i, "wrong secret key for the given ciphertext");
}
function nd(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "header");
	var i, a = 0 | U._crypto_secretstream_xchacha20poly1305_headerbytes();
	e.length !== a && Z(r, "invalid header length"), i = J(e), r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_secretstream_xchacha20poly1305_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(52).address;
	if (!(0 | U._crypto_secretstream_xchacha20poly1305_init_pull(c, i, o))) {
		var l = c;
		return Y(r), l;
	}
	X(r, "invalid usage");
}
function rd(e, t) {
	var n = [];
	K(t), e = $(n, e, "key");
	var r, i = 0 | U._crypto_secretstream_xchacha20poly1305_keybytes();
	e.length !== i && Z(n, "invalid key length"), r = J(e), n.push(r);
	var a = new q(52).address, o = new q(0 | U._crypto_secretstream_xchacha20poly1305_headerbytes()), s = o.address;
	if (n.push(s), !(0 | U._crypto_secretstream_xchacha20poly1305_init_push(a, s, r))) {
		var c = {
			state: a,
			header: G(o, t)
		};
		return Y(n), c;
	}
	X(n, "invalid usage");
}
function id(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_secretstream_xchacha20poly1305_keybytes()), r = n.address;
	t.push(r), U._crypto_secretstream_xchacha20poly1305_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function ad(e, t, n, r) {
	var i = [];
	K(r), Q(i, e, "state_address"), t = $(i, t, "cipher");
	var a, o = U._crypto_secretstream_xchacha20poly1305_abytes(), s = t.length;
	s < o && Z(i, "cipher is too short"), a = J(t), i.push(a);
	var c = null, l = 0;
	n != null && (c = J(n = $(i, n, "ad")), l = n.length, i.push(c));
	var u = new q(s - U._crypto_secretstream_xchacha20poly1305_abytes() | 0), d = u.address;
	i.push(d);
	var f, p = (f = Ps(1), i.push(f), (p = U._crypto_secretstream_xchacha20poly1305_pull(e, d, 0, f, a, s, 0, c, l) === 0 && {
		tag: U.HEAPU8[f],
		message: u
	}) && {
		message: G(p.message, r),
		tag: p.tag
	});
	return Y(i), p;
}
function od(e, t, n, r, i) {
	var a = [];
	K(i), Q(a, e, "state_address");
	var o = J(t = $(a, t, "message_chunk")), s = t.length;
	a.push(o);
	var c = null, l = 0;
	n != null && (c = J(n = $(a, n, "ad")), l = n.length, a.push(c)), Q(a, r, "tag"), (typeof r != "number" || (0 | r) !== r || r < 0) && Z(a, "tag must be an unsigned integer");
	var u = new q(s + U._crypto_secretstream_xchacha20poly1305_abytes() | 0), d = u.address;
	if (a.push(d), !(0 | U._crypto_secretstream_xchacha20poly1305_push(e, d, 0, o, s, 0, c, l, 0, r))) {
		var f = G(u, i);
		return Y(a), f;
	}
	X(a, "invalid usage");
}
function sd(e, t) {
	var n = [];
	return K(t), Q(n, e, "state_address"), U._crypto_secretstream_xchacha20poly1305_rekey(e), Y(n), !0;
}
function cd(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_shorthash_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_shorthash_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_shorthash(l, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function ld(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_shorthash_keybytes()), r = n.address;
	t.push(r), U._crypto_shorthash_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function ud(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "key");
	var o, s = 0 | U._crypto_shorthash_siphashx24_keybytes();
	t.length !== s && Z(r, "invalid key length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_shorthash_siphashx24_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_shorthash_siphashx24(l, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function dd(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "privateKey");
	var o, s = 0 | U._crypto_sign_secretkeybytes();
	t.length !== s && Z(r, "invalid privateKey length"), o = J(t), r.push(o);
	var c = new q(e.length + U._crypto_sign_bytes() | 0), l = c.address;
	if (r.push(l), !(0 | U._crypto_sign(l, null, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function fd(e, t, n) {
	var r = [];
	K(n);
	var i = J(e = $(r, e, "message")), a = e.length;
	r.push(i), t = $(r, t, "privateKey");
	var o, s = 0 | U._crypto_sign_secretkeybytes();
	t.length !== s && Z(r, "invalid privateKey length"), o = J(t), r.push(o);
	var c = new q(0 | U._crypto_sign_bytes()), l = c.address;
	if (r.push(l), !(0 | U._crypto_sign_detached(l, null, i, a, 0, o))) {
		var u = G(c, n);
		return Y(r), u;
	}
	X(r, "invalid usage");
}
function pd(e, t) {
	var n = [];
	K(t), e = $(n, e, "edPk");
	var r, i = 0 | U._crypto_sign_publickeybytes();
	e.length !== i && Z(n, "invalid edPk length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_scalarmult_scalarbytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_sign_ed25519_pk_to_curve25519(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid key");
}
function md(e, t) {
	var n = [];
	K(t), e = $(n, e, "edSk");
	var r, i = 0 | U._crypto_sign_secretkeybytes();
	e.length !== i && Z(n, "invalid edSk length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_scalarmult_scalarbytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_sign_ed25519_sk_to_curve25519(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid key");
}
function hd(e, t) {
	var n = [];
	K(t), e = $(n, e, "privateKey");
	var r, i = 0 | U._crypto_sign_secretkeybytes();
	e.length !== i && Z(n, "invalid privateKey length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_sign_publickeybytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_sign_ed25519_sk_to_pk(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid key");
}
function gd(e, t) {
	var n = [];
	K(t), e = $(n, e, "privateKey");
	var r, i = 0 | U._crypto_sign_secretkeybytes();
	e.length !== i && Z(n, "invalid privateKey length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_sign_seedbytes()), o = a.address;
	if (n.push(o), !(0 | U._crypto_sign_ed25519_sk_to_seed(o, r))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid key");
}
function _d(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address"), t = $(r, t, "privateKey");
	var i, a = 0 | U._crypto_sign_secretkeybytes();
	t.length !== a && Z(r, "invalid privateKey length"), i = J(t), r.push(i);
	var o = new q(0 | U._crypto_sign_bytes()), s = o.address;
	if (r.push(s), !(0 | U._crypto_sign_final_create(e, s, null, i))) {
		var c = (U._free(e), G(o, n));
		return Y(r), c;
	}
	X(r, "invalid usage");
}
function vd(e, t, n, r) {
	var i = [];
	K(r), Q(i, e, "state_address"), t = $(i, t, "signature");
	var a, o = 0 | U._crypto_sign_bytes();
	t.length !== o && Z(i, "invalid signature length"), a = J(t), i.push(a), n = $(i, n, "publicKey");
	var s, c = 0 | U._crypto_sign_publickeybytes();
	n.length !== c && Z(i, "invalid publicKey length"), s = J(n), i.push(s);
	var l = !(0 | U._crypto_sign_final_verify(e, a, s));
	return Y(i), l;
}
function yd(e) {
	var t = [];
	K(e);
	var n = new q(208).address;
	if (!(0 | U._crypto_sign_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "internal error");
}
function bd(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_sign_publickeybytes()), r = n.address;
	t.push(r);
	var i = new q(0 | U._crypto_sign_secretkeybytes()), a = i.address;
	if (t.push(a), !(0 | U._crypto_sign_keypair(r, a))) {
		var o = {
			publicKey: G(n, e),
			privateKey: G(i, e),
			keyType: "ed25519"
		};
		return Y(t), o;
	}
	X(t, "internal error");
}
function xd(e, t, n) {
	var r = [];
	K(n), e = $(r, e, "signedMessage");
	var i, a = U._crypto_sign_bytes(), o = e.length;
	o < a && Z(r, "signedMessage is too short"), i = J(e), r.push(i), t = $(r, t, "publicKey");
	var s, c = 0 | U._crypto_sign_publickeybytes();
	t.length !== c && Z(r, "invalid publicKey length"), s = J(t), r.push(s);
	var l = new q(o - U._crypto_sign_bytes() | 0), u = l.address;
	if (r.push(u), !(0 | U._crypto_sign_open(u, null, i, o, 0, s))) {
		var d = G(l, n);
		return Y(r), d;
	}
	X(r, "incorrect signature for the given public key");
}
function Sd(e, t) {
	var n = [];
	K(t), e = $(n, e, "seed");
	var r, i = 0 | U._crypto_sign_seedbytes();
	e.length !== i && Z(n, "invalid seed length"), r = J(e), n.push(r);
	var a = new q(0 | U._crypto_sign_publickeybytes()), o = a.address;
	n.push(o);
	var s = new q(0 | U._crypto_sign_secretkeybytes()), c = s.address;
	if (n.push(c), !(0 | U._crypto_sign_seed_keypair(o, c, r))) {
		var l = {
			publicKey: G(a, t),
			privateKey: G(s, t),
			keyType: "ed25519"
		};
		return Y(n), l;
	}
	X(n, "invalid usage");
}
function Cd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_sign_update(e, i, a, 0) && X(r, "invalid usage"), Y(r);
}
function wd(e, t, n) {
	var r = [];
	e = $(r, e, "signature");
	var i, a = 0 | U._crypto_sign_bytes();
	e.length !== a && Z(r, "invalid signature length"), i = J(e), r.push(i);
	var o = J(t = $(r, t, "message")), s = t.length;
	r.push(o), n = $(r, n, "publicKey");
	var c, l = 0 | U._crypto_sign_publickeybytes();
	n.length !== l && Z(r, "invalid publicKey length"), c = J(n), r.push(c);
	var u = !(0 | U._crypto_sign_verify_detached(i, o, s, 0, c));
	return Y(r), u;
}
function Td(e, t, n, r) {
	var i = [];
	K(r), Q(i, e, "outLength"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(i, "outLength must be an unsigned integer"), t = $(i, t, "key");
	var a, o = 0 | U._crypto_stream_chacha20_keybytes();
	t.length !== o && Z(i, "invalid key length"), a = J(t), i.push(a), n = $(i, n, "nonce");
	var s, c = 0 | U._crypto_stream_chacha20_noncebytes();
	n.length !== c && Z(i, "invalid nonce length"), s = J(n), i.push(s);
	var l = new q(0 | e), u = l.address;
	i.push(u), U._crypto_stream_chacha20(u, e, 0, s, a);
	var d = G(l, r);
	return Y(i), d;
}
function Ed(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "input_message")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_stream_chacha20_ietf_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "key");
	var l, u = 0 | U._crypto_stream_chacha20_ietf_keybytes();
	n.length !== u && Z(i, "invalid key length"), l = J(n), i.push(l);
	var d = new q(0 | o), f = d.address;
	if (i.push(f), U._crypto_stream_chacha20_ietf_xor(f, a, o, 0, s, l) === 0) {
		var p = G(d, r);
		return Y(i), p;
	}
	X(i, "invalid usage");
}
function Dd(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "input_message")), s = e.length;
	a.push(o), t = $(a, t, "nonce");
	var c, l = 0 | U._crypto_stream_chacha20_ietf_noncebytes();
	t.length !== l && Z(a, "invalid nonce length"), c = J(t), a.push(c), Q(a, n, "nonce_increment"), (typeof n != "number" || (0 | n) !== n || n < 0) && Z(a, "nonce_increment must be an unsigned integer"), r = $(a, r, "key");
	var u, d = 0 | U._crypto_stream_chacha20_ietf_keybytes();
	r.length !== d && Z(a, "invalid key length"), u = J(r), a.push(u);
	var f = new q(0 | s), p = f.address;
	if (a.push(p), U._crypto_stream_chacha20_ietf_xor_ic(p, o, s, 0, c, n, u) === 0) {
		var m = G(f, i);
		return Y(a), m;
	}
	X(a, "invalid usage");
}
function Od(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_stream_chacha20_keybytes()), r = n.address;
	t.push(r), U._crypto_stream_chacha20_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function kd(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "input_message")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_stream_chacha20_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "key");
	var l, u = 0 | U._crypto_stream_chacha20_keybytes();
	n.length !== u && Z(i, "invalid key length"), l = J(n), i.push(l);
	var d = new q(0 | o), f = d.address;
	if (i.push(f), U._crypto_stream_chacha20_xor(f, a, o, 0, s, l) === 0) {
		var p = G(d, r);
		return Y(i), p;
	}
	X(i, "invalid usage");
}
function Ad(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "input_message")), s = e.length;
	a.push(o), t = $(a, t, "nonce");
	var c, l = 0 | U._crypto_stream_chacha20_noncebytes();
	t.length !== l && Z(a, "invalid nonce length"), c = J(t), a.push(c), Q(a, n, "nonce_increment"), (typeof n != "number" || (0 | n) !== n || n < 0) && Z(a, "nonce_increment must be an unsigned integer"), r = $(a, r, "key");
	var u, d = 0 | U._crypto_stream_chacha20_keybytes();
	r.length !== d && Z(a, "invalid key length"), u = J(r), a.push(u);
	var f = new q(0 | s), p = f.address;
	if (a.push(p), U._crypto_stream_chacha20_xor_ic(p, o, s, 0, c, n, 0, u) === 0) {
		var m = G(f, i);
		return Y(a), m;
	}
	X(a, "invalid usage");
}
function jd(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_stream_keybytes()), r = n.address;
	t.push(r), U._crypto_stream_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function Md(e) {
	var t = [];
	K(e);
	var n = new q(0 | U._crypto_stream_xchacha20_keybytes()), r = n.address;
	t.push(r), U._crypto_stream_xchacha20_keygen(r);
	var i = G(n, e);
	return Y(t), i;
}
function Nd(e, t, n, r) {
	var i = [];
	K(r);
	var a = J(e = $(i, e, "input_message")), o = e.length;
	i.push(a), t = $(i, t, "nonce");
	var s, c = 0 | U._crypto_stream_xchacha20_noncebytes();
	t.length !== c && Z(i, "invalid nonce length"), s = J(t), i.push(s), n = $(i, n, "key");
	var l, u = 0 | U._crypto_stream_xchacha20_keybytes();
	n.length !== u && Z(i, "invalid key length"), l = J(n), i.push(l);
	var d = new q(0 | o), f = d.address;
	if (i.push(f), U._crypto_stream_xchacha20_xor(f, a, o, 0, s, l) === 0) {
		var p = G(d, r);
		return Y(i), p;
	}
	X(i, "invalid usage");
}
function Pd(e, t, n, r, i) {
	var a = [];
	K(i);
	var o = J(e = $(a, e, "input_message")), s = e.length;
	a.push(o), t = $(a, t, "nonce");
	var c, l = 0 | U._crypto_stream_xchacha20_noncebytes();
	t.length !== l && Z(a, "invalid nonce length"), c = J(t), a.push(c), Q(a, n, "nonce_increment"), (typeof n != "number" || (0 | n) !== n || n < 0) && Z(a, "nonce_increment must be an unsigned integer"), r = $(a, r, "key");
	var u, d = 0 | U._crypto_stream_xchacha20_keybytes();
	r.length !== d && Z(a, "invalid key length"), u = J(r), a.push(u);
	var f = new q(0 | s), p = f.address;
	if (a.push(p), U._crypto_stream_xchacha20_xor_ic(p, o, s, 0, c, n, 0, u) === 0) {
		var m = G(f, i);
		return Y(a), m;
	}
	X(a, "invalid usage");
}
function Fd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "out_length"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(r, "out_length must be an unsigned integer");
	var i = J(t = $(r, t, "message")), a = t.length;
	r.push(i);
	var o = new q(e |= 0), s = o.address;
	if (r.push(s), !(0 | U._crypto_xof_shake128(s, e, i, a, 0))) {
		var c = G(o, n);
		return Y(r), c;
	}
	X(r, "invalid usage");
}
function Id(e) {
	var t = [];
	K(e);
	var n = new q(256).address;
	if (!(0 | U._crypto_xof_shake128_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "invalid usage");
}
function Ld(e, t) {
	var n = [];
	K(t), Q(n, e, "domain"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(n, "domain must be an unsigned integer");
	var r = new q(256).address;
	if (!(0 | U._crypto_xof_shake128_init_with_domain(r, e))) {
		var i = r;
		return Y(n), i;
	}
	X(n, "invalid usage");
}
function Rd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address"), Q(r, t, "out_length"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(r, "out_length must be an unsigned integer");
	var i = new q(t |= 0), a = i.address;
	if (r.push(a), !(0 | U._crypto_xof_shake128_squeeze(e, a, t))) {
		var o = G(i, n);
		return Y(r), o;
	}
	X(r, "invalid usage");
}
function zd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_xof_shake128_update(e, i, a, 0) && X(r, "invalid usage"), Y(r);
}
function Bd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "out_length"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(r, "out_length must be an unsigned integer");
	var i = J(t = $(r, t, "message")), a = t.length;
	r.push(i);
	var o = new q(e |= 0), s = o.address;
	if (r.push(s), !(0 | U._crypto_xof_shake256(s, e, i, a, 0))) {
		var c = G(o, n);
		return Y(r), c;
	}
	X(r, "invalid usage");
}
function Vd(e) {
	var t = [];
	K(e);
	var n = new q(256).address;
	if (!(0 | U._crypto_xof_shake256_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "invalid usage");
}
function Hd(e, t) {
	var n = [];
	K(t), Q(n, e, "domain"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(n, "domain must be an unsigned integer");
	var r = new q(256).address;
	if (!(0 | U._crypto_xof_shake256_init_with_domain(r, e))) {
		var i = r;
		return Y(n), i;
	}
	X(n, "invalid usage");
}
function Ud(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address"), Q(r, t, "out_length"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(r, "out_length must be an unsigned integer");
	var i = new q(t |= 0), a = i.address;
	if (r.push(a), !(0 | U._crypto_xof_shake256_squeeze(e, a, t))) {
		var o = G(i, n);
		return Y(r), o;
	}
	X(r, "invalid usage");
}
function Wd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_xof_shake256_update(e, i, a, 0) && X(r, "invalid usage"), Y(r);
}
function Gd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "out_length"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(r, "out_length must be an unsigned integer");
	var i = J(t = $(r, t, "message")), a = t.length;
	r.push(i);
	var o = new q(e |= 0), s = o.address;
	if (r.push(s), !(0 | U._crypto_xof_turboshake128(s, e, i, a, 0))) {
		var c = G(o, n);
		return Y(r), c;
	}
	X(r, "invalid usage");
}
function Kd(e) {
	var t = [];
	K(e);
	var n = new q(256).address;
	if (!(0 | U._crypto_xof_turboshake128_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "invalid usage");
}
function qd(e, t) {
	var n = [];
	K(t), Q(n, e, "domain"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(n, "domain must be an unsigned integer");
	var r = new q(256).address;
	if (!(0 | U._crypto_xof_turboshake128_init_with_domain(r, e))) {
		var i = r;
		return Y(n), i;
	}
	X(n, "invalid usage");
}
function Jd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address"), Q(r, t, "out_length"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(r, "out_length must be an unsigned integer");
	var i = new q(t |= 0), a = i.address;
	if (r.push(a), !(0 | U._crypto_xof_turboshake128_squeeze(e, a, t))) {
		var o = G(i, n);
		return Y(r), o;
	}
	X(r, "invalid usage");
}
function Yd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_xof_turboshake128_update(e, i, a, 0) && X(r, "invalid usage"), Y(r);
}
function Xd(e, t, n) {
	var r = [];
	K(n), Q(r, e, "out_length"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(r, "out_length must be an unsigned integer");
	var i = J(t = $(r, t, "message")), a = t.length;
	r.push(i);
	var o = new q(e |= 0), s = o.address;
	if (r.push(s), !(0 | U._crypto_xof_turboshake256(s, e, i, a, 0))) {
		var c = G(o, n);
		return Y(r), c;
	}
	X(r, "invalid usage");
}
function Zd(e) {
	var t = [];
	K(e);
	var n = new q(256).address;
	if (!(0 | U._crypto_xof_turboshake256_init(n))) {
		var r = n;
		return Y(t), r;
	}
	X(t, "invalid usage");
}
function Qd(e, t) {
	var n = [];
	K(t), Q(n, e, "domain"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(n, "domain must be an unsigned integer");
	var r = new q(256).address;
	if (!(0 | U._crypto_xof_turboshake256_init_with_domain(r, e))) {
		var i = r;
		return Y(n), i;
	}
	X(n, "invalid usage");
}
function $d(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address"), Q(r, t, "out_length"), (typeof t != "number" || (0 | t) !== t || t < 0) && Z(r, "out_length must be an unsigned integer");
	var i = new q(t |= 0), a = i.address;
	if (r.push(a), !(0 | U._crypto_xof_turboshake256_squeeze(e, a, t))) {
		var o = G(i, n);
		return Y(r), o;
	}
	X(r, "invalid usage");
}
function ef(e, t, n) {
	var r = [];
	K(n), Q(r, e, "state_address");
	var i = J(t = $(r, t, "message_chunk")), a = t.length;
	r.push(i), 0 | U._crypto_xof_turboshake256_update(e, i, a, 0) && X(r, "invalid usage"), Y(r);
}
function tf(e, t) {
	var n = [];
	K(t), Q(n, e, "length"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(n, "length must be an unsigned integer");
	var r = new q(0 | e), i = r.address;
	n.push(i), U._randombytes_buf(i, e);
	var a = G(r, t);
	return Y(n), a;
}
function nf(e, t, n) {
	var r = [];
	K(n), Q(r, e, "length"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(r, "length must be an unsigned integer"), t = $(r, t, "seed");
	var i, a = 0 | U._randombytes_seedbytes();
	t.length !== a && Z(r, "invalid seed length"), i = J(t), r.push(i);
	var o = new q(0 | e), s = o.address;
	r.push(s), U._randombytes_buf_deterministic(s, e, i);
	var c = G(o, n);
	return Y(r), c;
}
function rf(e) {
	K(e), U._randombytes_close();
}
function af(e) {
	K(e);
	var t = U._randombytes_random() >>> 0;
	return Y([]), t;
}
function of(e, t) {
	var n = [];
	K(t);
	for (var r = U._malloc(24), i = 0; i < 6; i++) U.setValue(r + 4 * i, U.Runtime.addFunction(e[[
		"implementation_name",
		"random",
		"stir",
		"uniform",
		"buf",
		"close"
	][i]]), "i32");
	0 | U._randombytes_set_implementation(r) && X(n, "unsupported implementation"), Y(n);
}
function sf(e) {
	K(e), U._randombytes_stir();
}
function cf(e, t) {
	var n = [];
	K(t), Q(n, e, "upper_bound"), (typeof e != "number" || (0 | e) !== e || e < 0) && Z(n, "upper_bound must be an unsigned integer");
	var r = U._randombytes_uniform(e) >>> 0;
	return Y(n), r;
}
function lf(e) {
	var t, n = [];
	(e = $(n, e, "bin")).length !== 16 && Z(n, "invalid bin length"), t = J(e), n.push(t);
	var r = new q(46).address;
	if (n.push(r), U._sodium_bin2ip(r, 46, t) !== 0) {
		var i = U.UTF8ToString(r);
		return Y(n), i;
	}
	X(n, "conversion failed");
}
function uf(e, t) {
	var n = [];
	K(t), typeof e != "string" && Z(n, "ip must be a string");
	var r = J(e = ws(e + "\0")), i = e.length - 1;
	n.push(r);
	var a = new q(16), o = a.address;
	if (n.push(o), !(0 | U._sodium_ip2bin(o, r, i))) {
		var s = G(a, t);
		return Y(n), s;
	}
	X(n, "invalid IP address");
}
function df() {
	var e = U._sodium_version_string(), t = U.UTF8ToString(e);
	return Y([]), t;
}
q.prototype.to_Uint8Array = function() {
	var e = new Uint8Array(this.length);
	return e.set(U.HEAPU8.subarray(this.address, this.address + this.length)), e;
}, W.add = _s, W.base64_variants = Os, W.compare = xs, W.from_base64 = As, W.from_hex = Es, W.from_string = ws, W.increment = gs, W.is_zero = vs, W.memcmp = bs, W.memzero = ys, W.output_formats = Ms, W.pad = Ss, W.unpad = Cs, W.ready = ms, W.symbols = hs, W.to_base64 = js, W.to_hex = Ds, W.to_string = Ts;
//#endregion
//#region src/background/githubInstaller.js
var ff = "bmFtZTogUmVwb093bCBQUiBBbmFseXplcgoKb246CiAgcHVsbF9yZXF1ZXN0OgogICAgdHlwZXM6IFtvcGVuZWQsIHJlYWR5X2Zvcl9yZXZpZXddCiAgaXNzdWVfY29tbWVudDoKICAgIHR5cGVzOiBbY3JlYXRlZF0KCnBlcm1pc3Npb25zOgogIHB1bGwtcmVxdWVzdHM6IHdyaXRlCiAgaXNzdWVzOiB3cml0ZQogIGNvbnRlbnRzOiB3cml0ZQoKam9iczoKICBhbmFseXplLXByOgogICAgIyBPbmx5IHJ1biBpZiBpdCdzIGEgUFIgY3JlYXRpb24gT1IgaWYgdGhlIGNvbW1lbnQgY29udGFpbnMgZXhhY3RseSAiL2FuYWx5emUiIChvciAiL2FuYWx5c2UiKQogICAgaWY6ID4KICAgICAgZ2l0aHViLmV2ZW50X25hbWUgPT0gJ3B1bGxfcmVxdWVzdCcgfHwKICAgICAgKGdpdGh1Yi5ldmVudC5pc3N1ZS5wdWxsX3JlcXVlc3QgJiYgKGNvbnRhaW5zKGdpdGh1Yi5ldmVudC5jb21tZW50LmJvZHksICcvYW5hbHl6ZScpIHx8IGNvbnRhaW5zKGdpdGh1Yi5ldmVudC5jb21tZW50LmJvZHksICcvYW5hbHlzZScpKSkKCiAgICBydW5zLW9uOiB1YnVudHUtbGF0ZXN0CgogICAgc3RlcHM6CiAgICAgIC0gbmFtZTogQ2hlY2tvdXQgUmVwb3NpdG9yeQogICAgICAgIHVzZXM6IGFjdGlvbnMvY2hlY2tvdXRAdjQKCiAgICAgIC0gbmFtZTogU2V0dXAgTm9kZS5qcwogICAgICAgIHVzZXM6IGFjdGlvbnMvc2V0dXAtbm9kZUB2NAogICAgICAgIHdpdGg6CiAgICAgICAgICBub2RlLXZlcnNpb246ICcyMCcKCgogICAgICAtIG5hbWU6IFJ1biBSZXBvT3dsIFBSIEFuYWx5c2lzCiAgICAgICAgZW52OgogICAgICAgICAgR1JPUV9BUElfS0VZOiAke3sgc2VjcmV0cy5HUk9RX0FQSV9LRVkgfX0KICAgICAgICAgIEdJVEhVQl9UT0tFTjogJHt7IHNlY3JldHMuR0lUSFVCX1RPS0VOIH19CiAgICAgICAgICBQUl9OVU1CRVI6ICR7eyBnaXRodWIuZXZlbnQucHVsbF9yZXF1ZXN0Lm51bWJlciB8fCBnaXRodWIuZXZlbnQuaXNzdWUubnVtYmVyIH19CiAgICAgICAgICBSRVBPU0lUT1JZOiAke3sgZ2l0aHViLnJlcG9zaXRvcnkgfX0KICAgICAgICBydW46IG5vZGUgLmdpdGh1Yi9zY3JpcHRzL2FuYWx5emUtcHIuanM=", pf = "Cgpjb25zdCBHUk9RX0FQSV9LRVkgPSBwcm9jZXNzLmVudi5HUk9RX0FQSV9LRVk7CmNvbnN0IEdJVEhVQl9UT0tFTiA9IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTjsKY29uc3QgUFJfTlVNQkVSID0gcHJvY2Vzcy5lbnYuUFJfTlVNQkVSOwpjb25zdCBSRVBPU0lUT1JZID0gcHJvY2Vzcy5lbnYuUkVQT1NJVE9SWTsgLy8gZm9ybWF0OiBvd25lci9yZXBvCgpjb25zdCBHUk9RX1VSTCA9ICdodHRwczovL2FwaS5ncm9xLmNvbS9vcGVuYWkvdjEvY2hhdC9jb21wbGV0aW9ucyc7CmNvbnN0IE1PREVMX05BTUUgPSAnbGxhbWEtMy4zLTcwYi12ZXJzYXRpbGUnOwoKYXN5bmMgZnVuY3Rpb24gYXNrR3JvcShwcm9tcHQpIHsKICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKEdST1FfVVJMLCB7CiAgICBtZXRob2Q6ICdQT1NUJywKICAgIGhlYWRlcnM6IHsKICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7R1JPUV9BUElfS0VZfWAsCiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicKICAgIH0sCiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7CiAgICAgIG1vZGVsOiBNT0RFTF9OQU1FLAogICAgICBtZXNzYWdlczogW3sgcm9sZTogInVzZXIiLCBjb250ZW50OiBwcm9tcHQgfV0KICAgIH0pCiAgfSk7CiAgaWYgKCFyZXNwb25zZS5vaykgewogICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpOwogICAgdGhyb3cgbmV3IEVycm9yKGBHcm9xIEFQSSBlcnJvcjogJHtlcnJvclRleHR9YCk7CiAgfQogIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7CiAgcmV0dXJuIGRhdGEuY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQ7Cn0KCmFzeW5jIGZ1bmN0aW9uIHJ1bigpIHsKICBpZiAoIUdST1FfQVBJX0tFWSB8fCAhR0lUSFVCX1RPS0VOKSB7CiAgICBjb25zb2xlLmVycm9yKCJNaXNzaW5nIEdST1FfQVBJX0tFWSBvciBHSVRIVUJfVE9LRU4gc2VjcmV0LiIpOwogICAgcHJvY2Vzcy5leGl0KDEpOwogIH0KCiAgY29uc29sZS5sb2coYFN0YXJ0aW5nIFJlcG9Pd2wgTWFwLVJlZHVjZSBBbmFseXNpcyBmb3IgUFIgIyR7UFJfTlVNQkVSfSBpbiAke1JFUE9TSVRPUll9Li4uYCk7CgogIC8vIDEuIEZldGNoIFBSIERldGFpbHMKICBjb25zdCBwclJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvJHtSRVBPU0lUT1JZfS9wdWxscy8ke1BSX05VTUJFUn1gLCB7CiAgICBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke0dJVEhVQl9UT0tFTn1gIH0KICB9KTsKICBjb25zdCBwckRhdGEgPSBhd2FpdCBwclJlc3BvbnNlLmpzb24oKTsKCiAgLy8gMi4gRmV0Y2ggUFIgRGlmZnMKICBjb25zdCBkaWZmUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke1JFUE9TSVRPUll9L3B1bGxzLyR7UFJfTlVNQkVSfS9maWxlc2AsIHsKICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7R0lUSFVCX1RPS0VOfWAgfQogIH0pOwogIGNvbnN0IGZpbGVzRGF0YSA9IGF3YWl0IGRpZmZSZXNwb25zZS5qc29uKCk7CgogIC8vIDMuIENoZWNrIGZvciBMaW5rZWQgSXNzdWVzCiAgbGV0IGxpbmtlZElzc3VlQ29udGV4dCA9ICJObyBsaW5rZWQgaXNzdWUgZGV0ZWN0ZWQuIjsKICBjb25zdCBpc3N1ZU1hdGNoID0gcHJEYXRhLmJvZHkgPyBwckRhdGEuYm9keS5tYXRjaCgvKD86Zml4fGZpeGVzfHJlc29sdmVzfGNsb3NlcylccysjKFxkKykvaSkgOiBudWxsOwogIAogIGlmIChpc3N1ZU1hdGNoKSB7CiAgICBjb25zdCBpc3N1ZU51bSA9IGlzc3VlTWF0Y2hbMV07CiAgICBjb25zb2xlLmxvZyhgRGV0ZWN0ZWQgbGlua2VkIGlzc3VlICMke2lzc3VlTnVtfS4gRmV0Y2hpbmcgY29udGV4dC4uLmApOwogICAgY29uc3QgaXNzdWVSZXMgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke1JFUE9TSVRPUll9L2lzc3Vlcy8ke2lzc3VlTnVtfWAsIHsKICAgICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtHSVRIVUJfVE9LRU59YCB9CiAgICB9KTsKICAgIGlmIChpc3N1ZVJlcy5vaykgewogICAgICBjb25zdCBpc3N1ZURldGFpbHMgPSBhd2FpdCBpc3N1ZVJlcy5qc29uKCk7CiAgICAgIGxpbmtlZElzc3VlQ29udGV4dCA9IGBMaW5rZWQgSXNzdWUgR29hbDogJHtpc3N1ZURldGFpbHMudGl0bGV9XG4ke2lzc3VlRGV0YWlscy5ib2R5fWA7CiAgICB9CiAgfQoKICAvLyA0LiBNQVAgUEhBU0U6IFN1bW1hcml6ZSBpbmRpdmlkdWFsIGZpbGVzCiAgY29uc3QgZmlsdGVyZWRGaWxlcyA9IGZpbGVzRGF0YS5maWx0ZXIoZiA9PiAKICAgICFmLmZpbGVuYW1lLmluY2x1ZGVzKCdwYWNrYWdlLWxvY2suanNvbicpICYmIAogICAgIWYuZmlsZW5hbWUuZW5kc1dpdGgoJy5zdmcnKSAmJgogICAgZi5wYXRjaAogICk7CgogIGNvbnNvbGUubG9nKGBNYXBwaW5nICR7ZmlsdGVyZWRGaWxlcy5sZW5ndGh9IGZpbGVzLi4uYCk7CiAgY29uc3QgZmlsZVN1bW1hcmllcyA9IFtdOwogIAogIGZvciAoY29uc3QgZmlsZSBvZiBmaWx0ZXJlZEZpbGVzKSB7CiAgICB0cnkgewogICAgICBjb25zb2xlLmxvZyhgU3VtbWFyaXppbmcgJHtmaWxlLmZpbGVuYW1lfS4uLmApOwogICAgICBjb25zdCBtYXBQcm9tcHQgPSBgCiAgICAgICAgQnJpZWZseSBzdW1tYXJpemUgd2hhdCB0aGlzIHNwZWNpZmljIGZpbGUgZGlmZiBkb2VzIGluIDIgc2VudGVuY2VzIG1heC4KICAgICAgICBGaWxlOiAke2ZpbGUuZmlsZW5hbWV9CiAgICAgICAgU3RhdHVzOiAke2ZpbGUuc3RhdHVzfQogICAgICAgIFBhdGNoOgogICAgICAgICR7ZmlsZS5wYXRjaC5zdWJzdHJpbmcoMCwgMTAwMDApfQogICAgICBgOwogICAgICBjb25zdCBzdW1tYXJ5ID0gYXdhaXQgYXNrR3JvcShtYXBQcm9tcHQpOwogICAgICBmaWxlU3VtbWFyaWVzLnB1c2goYC0gKioke2ZpbGUuZmlsZW5hbWV9Kio6ICR7c3VtbWFyeX1gKTsKICAgICAgLy8gU2ltcGxlIGRlbGF5IHRvIGF2b2lkIHJhdGUgbGltaXRzCiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7CiAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3Qgc3VtbWFyaXplICR7ZmlsZS5maWxlbmFtZX06YCwgZXJyLm1lc3NhZ2UpOwogICAgfQogIH0KCiAgLy8gNS4gUkVEVUNFIFBIQVNFOiBGaW5hbCBBbmFseXNpcwogIGNvbnNvbGUubG9nKCJSZWR1Y2luZyBzdW1tYXJpZXMgaW50byBmaW5hbCBhbmFseXNpcy4uLiIpOwogIGNvbnN0IHJlZHVjZVByb21wdCA9IGAKICAgIFlvdSBhcmUgYW4gZXhwZXJ0LCBydXRobGVzcyBBSSBDb2RlIFJldmlld2VyIGZvciBSZXBvT3dsLgogICAgCiAgICBQUiBUaXRsZTogJHtwckRhdGEudGl0bGV9CiAgICBQUiBEZXNjcmlwdGlvbjogJHtwckRhdGEuYm9keSB8fCAiTm9uZSBwcm92aWRlZC4ifQogICAgCiAgICAke2xpbmtlZElzc3VlQ29udGV4dH0KICAgIAogICAgQ29kZSBDaGFuZ2VzIFN1bW1hcmllcyAoTWFwIFBoYXNlKToKICAgICR7ZmlsZVN1bW1hcmllcy5sZW5ndGggPiAwID8gZmlsZVN1bW1hcmllcy5qb2luKCdcbicpIDogIk5vIHNpZ25pZmljYW50IGNvZGUgY2hhbmdlcyBmb3VuZC4ifQogICAgCiAgICBBbmFseXplIHRoZSBQUiBhbmQgb3V0cHV0IHlvdXIgcmVzcG9uc2UgaW4gTWFya2Rvd24gZm9ybWF0LiBZb3VyIHJlc3BvbnNlIE1VU1QgaW5jbHVkZSB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZWQgc2VjdGlvbnM6CiAgICAKICAgIDEuICoqU2xvcCBCYWRnZSoqOiBPdXRwdXQgZXhhY3RseSBvbmUgb2YgdGhlc2UgdHdvIHBocmFzZXMgYXQgdGhlIHZlcnkgYmVnaW5uaW5nIGJhc2VkIG9uIGlmIHRoZSBjb2RlIGdlbnVpbmVseSBtYXRjaGVzIHRoZSBQUiBkZXNjcmlwdGlvbjoKICAgICAgICLwn5+iIFtDb2RlIE1hdGNoZXMgRGVzY3JpcHRpb25dIiBvciAi8J+UtCBb4pqg77iPIEFJIFNsb3AgRGV0ZWN0ZWRdIgogICAgMi4gKipBSSBTbG9wIERldGVjdGlvbioqOiBFeHBsYWluIHlvdXIgcmVhc29uaW5nIGZvciB0aGUgYmFkZ2UuIElzIHRoZSBkZXNjcmlwdGlvbiBoYWxsdWNpbmF0ZWQvaW5hY2N1cmF0ZT8KICAgIDMuICoqSXNzdWUgUmVzb2x1dGlvbioqOiBEb2VzIHRoZSBjb2RlIGFjdHVhbGx5IHNvbHZlIHRoZSBsaW5rZWQgaXNzdWU/CiAgICA0LiAqKkRvbWFpbiBJbXBhY3QqKjogQSBicmllZiBidWxsZXRlZCBsaXN0IG9mIHdoaWNoIGNvbXBvbmVudHMvZG9tYWlucyB3ZXJlIHRvdWNoZWQgKGUuZy4sIEZyb250ZW5kLCBEYXRhYmFzZSkuCiAgICA1LiAqKkJyZWFraW5nIENoYW5nZXMqKjogQXJlIHRoZXJlIGFueT8KICAgIDYuICoqRmluYWwgVmVyZGljdCoqOiBBcHByb3ZlIG9yIFJlcXVlc3QgQ2hhbmdlcyBiYXNlZCBvbiBjb2RlIHF1YWxpdHkgYW5kIGFjY3VyYWN5LgogIGA7CgogIGNvbnN0IGFuYWx5c2lzT3V0cHV0ID0gYXdhaXQgYXNrR3JvcShyZWR1Y2VQcm9tcHQpOwoKICAvLyA2LiBQb3N0IHRoZSBSZXZpZXcgYmFjayB0byBHaXRIdWIKICBjb25zb2xlLmxvZygiUG9zdGluZyBSZXZpZXcgdG8gR2l0SHViLi4uIik7CiAgY29uc3QgY29tbWVudEJvZHkgPSBgIyMjIPCfpokgUmVwb093bCBQUiBBbmFseXNpc1xuXG4ke2FuYWx5c2lzT3V0cHV0fVxuXG4qQW5hbHl6ZWQgYXV0b21hdGljYWxseSB2aWEgR2l0SHViIEFjdGlvbnMqYDsKICAKICBjb25zdCBpc0FwcHJvdmVkID0gYW5hbHlzaXNPdXRwdXQuaW5jbHVkZXMoIkNvZGUgTWF0Y2hlcyBEZXNjcmlwdGlvbiIpOwogIGNvbnN0IHJldmlld0V2ZW50ID0gaXNBcHByb3ZlZCA/ICJBUFBST1ZFIiA6ICJSRVFVRVNUX0NIQU5HRVMiOwoKICBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke1JFUE9TSVRPUll9L3B1bGxzLyR7UFJfTlVNQkVSfS9yZXZpZXdzYCwgewogICAgbWV0aG9kOiAnUE9TVCcsCiAgICBoZWFkZXJzOiB7CiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke0dJVEhVQl9UT0tFTn1gLAogICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nCiAgICB9LAogICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBib2R5OiBjb21tZW50Qm9keSwgZXZlbnQ6IHJldmlld0V2ZW50IH0pCiAgfSk7CgogIGNvbnNvbGUubG9nKCJBZGRpbmcgbGFiZWwgdG8gUFIuLi4iKTsKICBhd2FpdCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke1JFUE9TSVRPUll9L2lzc3Vlcy8ke1BSX05VTUJFUn0vbGFiZWxzYCwgewogICAgbWV0aG9kOiAnUE9TVCcsCiAgICBoZWFkZXJzOiB7CiAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke0dJVEhVQl9UT0tFTn1gLAogICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nCiAgICB9LAogICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBsYWJlbHM6IFsncmVwb293bC1hbmFseXplZCddIH0pCiAgfSk7CgogIGNvbnNvbGUubG9nKCJBbmFseXNpcyBwb3N0ZWQgc3VjY2Vzc2Z1bGx5ISIpOwp9CgpydW4oKS5jYXRjaChlcnIgPT4gewogIGNvbnNvbGUuZXJyb3IoIldvcmtmbG93IGZhaWxlZDoiLCBlcnIpOwogIHByb2Nlc3MuZXhpdCgxKTsKfSk7Cg==", mf = atob(ff), hf = atob(pf);
async function gf(e, t) {
	await W.ready;
	let n = W, r = n.from_base64(t, n.base64_variants.ORIGINAL), i = n.from_string(e), a = n.crypto_box_seal(i, r);
	return n.to_base64(a, n.base64_variants.ORIGINAL);
}
async function _f(e) {
	if (e) return e;
	throw Error("No GitHub Personal Access Token provided. Please enter one.");
}
async function vf(e, t, n, r, i, a) {
	let o = btoa(unescape(encodeURIComponent(i))), s = `https://api.github.com/repos/${t}/${n}/contents/${r}`, c;
	try {
		let t = await fetch(s, { headers: { Authorization: `Bearer ${e}` } });
		t.ok && (c = (await t.json()).sha);
	} catch {}
	let l = {
		message: a,
		content: o
	};
	c && (l.sha = c);
	let u = await fetch(s, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${e}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(l)
	});
	if (!u.ok) {
		let e = await u.json();
		throw Error(`Failed to push ${r}: ${e.message}`);
	}
}
async function yf(e, t, n, r) {
	let i = await fetch(`https://api.github.com/repos/${t}/${n}/actions/secrets/public-key`, { headers: { Authorization: `Bearer ${e}` } });
	if (!i.ok) {
		let e = await i.json();
		throw Error(`Failed to fetch public key: ${e.message}`);
	}
	let a = await i.json(), o = a.key_id, s = a.key, c = await gf(r, s), l = await fetch(`https://api.github.com/repos/${t}/${n}/actions/secrets/GROQ_API_KEY`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${e}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			encrypted_value: c,
			key_id: o
		})
	});
	if (!l.ok) {
		let e = await l.json();
		throw Error(`Failed to upload secret: ${e.message}`);
	}
}
async function bf(e, t, n) {
	let [r, i] = e.split("/");
	if (!n) throw Error("GROQ_API_KEY is not set in extension options.");
	let a = await _f(t);
	return await vf(a, r, i, ".github/workflows/repoowl-analyze.yml", mf, "Initialize RepoOwl PR Analyzer Action"), await vf(a, r, i, ".github/scripts/analyze-pr.js", hf, "Add RepoOwl Map-Reduce script"), await yf(a, r, i, n), !0;
}
//#endregion
//#region src/background.js
var xf = 2e3, Sf = (e) => new Promise((t) => setTimeout(t, e));
chrome.runtime.onMessage.addListener((e, t, n) => {
	if (e.action === "open_settings") chrome.runtime.openOptionsPage();
	else if (e.action === "force_sync_issues") return Rf([e.repoName]).then(() => n({ success: !0 })).catch((e) => n({ error: e.message })), !0;
	else if (e.action === "add_repo") Cf(e.repoName).catch((e) => console.error("Error auto-publishing config:", e)), n({ success: !0 });
	else if (e.action === "check_mediator_status") return Ef(e.repoName).then((e) => n(e)).catch((e) => n({ error: e.message })), !0;
	else if (e.action === "initialize_repoowl_pr") return bf(e.repoName, e.githubPat, e.groqApiKey).then(() => n({ success: !0 })).catch((e) => n({ error: e.message })), !0;
});
async function Cf(e) {
	let t = (await chrome.storage.local.get(["repoOwlConfig"])).repoOwlConfig || {};
	if (!(!t.githubToken || !t.supabaseUrl || !t.supabaseAnonKey)) try {
		let n = await fetch(`https://api.github.com/repos/${e}`, { headers: {
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			Authorization: `Bearer ${t.githubToken}`
		} });
		if (!n.ok) return;
		let r = await n.json();
		(r.permissions?.push === !0 || r.permissions?.admin === !0) && (await wf(e, t), await Tf(e, t));
	} catch (t) {
		console.error(`[${e}] Error verifying permissions for auto-publish:`, t);
	}
}
async function wf(e, t) {
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
async function Tf(e, t, n = console.log) {
	let [r, i] = e.split("/"), a = ta("https://sdgazpgnenkammrlhjel.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", { auth: { persistSession: !1 } });
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
async function Ef(e) {
	let [t, n] = e.split("/");
	try {
		let { data: e, error: r } = await ta("https://sdgazpgnenkammrlhjel.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", { auth: { persistSession: !1 } }).from("registry").select("created_at").eq("owner", t).eq("repo", n).single();
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
async function Df(e, t) {
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
async function Of(e, t) {
	let { data: n, error: r } = await (await ss()).from("issues").select("issue_number, analysis_summary").eq("repo_name", e).eq("status", "open").order("created_at", { ascending: !1 }).limit(50);
	return r ? (console.error("Error fetching history:", r), []) : n || [];
}
function kf(e) {
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
async function Af(e, t, n = 3) {
	for (let r = 0; r < n; r++) try {
		return await e.chat.completions.create(t);
	} catch (e) {
		if (e.status === 429 && r < n - 1) {
			let t = 6e3, n = e.message?.match(/Please try again in ([\d.]+)s/);
			n && (t = Math.ceil(parseFloat(n[1]) * 1e3) + 500), console.warn(`Rate limit hit. Waiting ${t}ms before retry...`), await Sf(t);
		} else throw e;
	}
}
async function jf(e, t, n) {
	let r = new H({
		apiKey: n,
		dangerouslyAllowBrowser: !0
	}), i = t.map((e) => `[Issue ID: #${e.issue_number}]\nTitle: ${e.title || "Unknown Title"}\nTechnical Summary: ${e.analysis_summary}`).join("\n\n---\n\n"), a = kf(e.body || ""), o = (await Af(r, {
		messages: [{
			role: "system",
			content: "You are an expert GitHub triage AI.\nThe user is drafting a new issue. I am providing you with a list of currently OPEN issues in this repository.\nDo not assume any issues have been resolved, because they are all actively open.\nYour job is to determine if the user's draft is a DUPLICATE of one of these specific OPEN issues.\nIf they are reporting a bug that already exists in this open list, flag it as a duplicate.\nYou must respond in valid JSON format matching this schema:\n{ \"is_duplicate\": boolean, \"analysis_summary\": \"string\" }\nEnsure the JSON is well-formed."
		}, {
			role: "user",
			content: es($o, ts({
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
async function Mf(e, t, n, r) {
	let { error: i } = await (await ss()).from("issues").insert({
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
async function Nf(e, t, n, r) {
	let { error: i } = await (await ss()).from("public_ecosystem_registry").upsert({
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
async function Pf(e, t, n) {
	let { data: r, error: i } = await t.from("issues").select("issue_number").eq("repo_name", e).eq("status", "open");
	if (i || !r) return;
	let a = new Set(n.map((e) => e.number)), o = r.map((e) => e.issue_number).filter((e) => !a.has(e));
	if (o.length > 0) {
		console.log(`RepoOwl: Found ${o.length} issues that are no longer open. Updating...`);
		let { error: n } = await t.from("issues").update({ status: "closed" }).eq("repo_name", e).in("issue_number", o);
		n && console.error("Error closing issues in Supabase:", n);
	}
}
async function Ff(e) {
	let t = await chrome.storage.local.get(["repoOwlConfig", "trackedRepositories"]), n = t.repoOwlConfig || {}, r = e || t.trackedRepositories || [];
	return n.groqApiKey, n.supabaseUrl ||= "https://sdgazpgnenkammrlhjel.supabase.co", n.supabaseAnonKey ||= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", {
		keys: n,
		repos: r
	};
}
function If(e) {
	return (t) => {
		typeof chrome < "u" && chrome.runtime && chrome.runtime.sendMessage({
			action: "sync_progress",
			message: t,
			log_type: e
		}).catch(() => {}), console.log(`[${e}] ${t}`);
	};
}
async function Lf(e, t, n) {
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
async function Rf(e = null) {
	let { keys: t, repos: n } = await Ff(e), r = If("issue");
	if (!t.groqApiKey || !t.supabaseUrl) {
		r("RepoOwl: API Keys not configured. Skipping sync.");
		return;
	}
	let i = await cs();
	if (i.error) {
		r(`RepoOwl: Could not authenticate with Supabase: ${i.error}`);
		return;
	}
	let a = await ss();
	for (let e of n) {
		r(`\n[${e}] Starting issue sync...`);
		let n = !1, i = null;
		try {
			let a = await Lf(e, t, r);
			if (!a) continue;
			if (n = a.isMaintainer, i = a.currentUserLogin, n) {
				r(`[${e}] Confirmed Maintainer. Fetching issues...`);
				try {
					await wf(e, t), await Tf(e, t, r);
				} catch (t) {
					r(`[${e}] Warning: Failed to auto-publish Hub config: ${t.message}`);
				}
			} else {
				r(`[${e}] Contributor detected. Starting Sandbox sync...`);
				try {
					let [t, n] = e.split("/"), i = null;
					i = ta("https://sdgazpgnenkammrlhjel.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2F6cGduZW5rYW1tcmxoamVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2Njc0NjksImV4cCI6MjA5OTI0MzQ2OX0.BLL0bYxbYH8-hIe1BFErCvpWbdirjvAWh9t3sw7od3I", { auth: { persistSession: !1 } });
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
						let { data: t, error: n } = await ta(a.supabaseUrl, a.supabaseAnonKey, { auth: { persistSession: !1 } }).from("issues").select("id, issue_number, is_duplicate, analysis_summary").eq("repo_name", e).eq("status", "open");
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
		let o, s, c, l;
		try {
			let { data: n, error: r } = await a.from("issues").select("issue_number, is_duplicate").eq("repo_name", e);
			if (r) throw Error(`Failed to fetch processed issues: ${r.message || JSON.stringify(r)}`);
			s = new Set((n || []).map((e) => e.issue_number)), c = s.size, l = (n || []).filter((e) => e.is_duplicate).length, o = await Df(e, t.githubToken);
		} catch (t) {
			r(`[${e}] Error during issue fetching: ${t.message}`);
			continue;
		}
		n && await Pf(e, a, o);
		let u = o.filter((e) => !s.has(e.number));
		n ? r(`[${e}] ${s.size} already processed. ${u.length} issues need processing.`) : i ? (u = u.filter((e) => e.user && e.user.login === i), r(`[${e}] Found ${u.length} unprocessed issues authored by you.`)) : (r(`[${e}] Could not determine your GitHub username, skipping sandbox processing.`), u = []);
		for (let n of u) try {
			r(`[${e}] Processing issue #${n.number}...`);
			let i = await Of(e, t);
			i.forEach((e) => {
				let t = o.find((t) => t.number === e.issue_number);
				t && (e.title = t.title);
			});
			let a = await jf(n, i, t.groqApiKey);
			await Mf(e, n, a, t), c++, a.is_duplicate && l++, await Sf(xf);
		} catch (t) {
			let i = t.message || String(t);
			r(`[${e}] Error processing issue #${n.number}: ${i}`);
			continue;
		}
		let d = c, f = l;
		if (n) try {
			let { data: t } = await a.from("issues").select("id, issue_number, is_duplicate, analysis_summary").eq("repo_name", e).eq("status", "open");
			t && await chrome.storage.local.set({ [`hub_cache_${e}`]: t });
		} catch (e) {
			console.error(e);
		}
		else {
			let t = (await chrome.storage.local.get([`hub_cache_${e}`]))[`hub_cache_${e}`] || [], n = new Set(t.map((e) => e.issue_number));
			s.forEach((e) => n.add(e)), d = n.size, f = l + t.filter((e) => e.is_duplicate).length;
		}
		await Nf(e, d, f, t), r(`[${e}] Issue Sync complete. Total Analyzed: ${d}, Duplicates: ${f}`);
	}
}
//#endregion
