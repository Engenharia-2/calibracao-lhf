//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let node_path = require("node:path");
node_path = __toESM(node_path);
//#region node_modules/dotenv/lib/main.js
var require_main = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = require("fs");
	var path$1 = require("path");
	var os = require("os");
	var crypto = require("crypto");
	var TIPS = [
		"◈ encrypted .env [www.dotenvx.com]",
		"◈ secrets for agents [www.dotenvx.com]",
		"⌁ auth for agents [www.vestauth.com]",
		"⌘ custom filepath { path: '/custom/path/.env' }",
		"⌘ enable debugging { debug: true }",
		"⌘ override existing { override: true }",
		"⌘ suppress logs { quiet: true }",
		"⌘ multiple files { path: ['.env.local', '.env'] }"
	];
	function _getRandomTip() {
		return TIPS[Math.floor(Math.random() * TIPS.length)];
	}
	function parseBoolean(value) {
		if (typeof value === "string") return ![
			"false",
			"0",
			"no",
			"off",
			""
		].includes(value.toLowerCase());
		return Boolean(value);
	}
	function supportsAnsi() {
		return process.stdout.isTTY;
	}
	function dim(text) {
		return supportsAnsi() ? `\x1b[2m${text}\x1b[0m` : text;
	}
	var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
	function parse(src) {
		const obj = {};
		let lines = src.toString();
		lines = lines.replace(/\r\n?/gm, "\n");
		let match;
		while ((match = LINE.exec(lines)) != null) {
			const key = match[1];
			let value = match[2] || "";
			value = value.trim();
			const maybeQuote = value[0];
			value = value.replace(/^(['"`])([\s\S]*)\1$/gm, "$2");
			if (maybeQuote === "\"") {
				value = value.replace(/\\n/g, "\n");
				value = value.replace(/\\r/g, "\r");
			}
			obj[key] = value;
		}
		return obj;
	}
	function _parseVault(options) {
		options = options || {};
		const vaultPath = _vaultPath(options);
		options.path = vaultPath;
		const result = DotenvModule.configDotenv(options);
		if (!result.parsed) {
			const err = /* @__PURE__ */ new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
			err.code = "MISSING_DATA";
			throw err;
		}
		const keys = _dotenvKey(options).split(",");
		const length = keys.length;
		let decrypted;
		for (let i = 0; i < length; i++) try {
			const attrs = _instructions(result, keys[i].trim());
			decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
			break;
		} catch (error) {
			if (i + 1 >= length) throw error;
		}
		return DotenvModule.parse(decrypted);
	}
	function _warn(message) {
		console.error(`⚠ ${message}`);
	}
	function _debug(message) {
		console.log(`┆ ${message}`);
	}
	function _log(message) {
		console.log(`◇ ${message}`);
	}
	function _dotenvKey(options) {
		if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) return options.DOTENV_KEY;
		if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) return process.env.DOTENV_KEY;
		return "";
	}
	function _instructions(result, dotenvKey) {
		let uri;
		try {
			uri = new URL(dotenvKey);
		} catch (error) {
			if (error.code === "ERR_INVALID_URL") {
				const err = /* @__PURE__ */ new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
				err.code = "INVALID_DOTENV_KEY";
				throw err;
			}
			throw error;
		}
		const key = uri.password;
		if (!key) {
			const err = /* @__PURE__ */ new Error("INVALID_DOTENV_KEY: Missing key part");
			err.code = "INVALID_DOTENV_KEY";
			throw err;
		}
		const environment = uri.searchParams.get("environment");
		if (!environment) {
			const err = /* @__PURE__ */ new Error("INVALID_DOTENV_KEY: Missing environment part");
			err.code = "INVALID_DOTENV_KEY";
			throw err;
		}
		const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
		const ciphertext = result.parsed[environmentKey];
		if (!ciphertext) {
			const err = /* @__PURE__ */ new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
			err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
			throw err;
		}
		return {
			ciphertext,
			key
		};
	}
	function _vaultPath(options) {
		let possibleVaultPath = null;
		if (options && options.path && options.path.length > 0) if (Array.isArray(options.path)) {
			for (const filepath of options.path) if (fs.existsSync(filepath)) possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
		} else possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
		else possibleVaultPath = path$1.resolve(process.cwd(), ".env.vault");
		if (fs.existsSync(possibleVaultPath)) return possibleVaultPath;
		return null;
	}
	function _resolveHome(envPath) {
		return envPath[0] === "~" ? path$1.join(os.homedir(), envPath.slice(1)) : envPath;
	}
	function _configVault(options) {
		const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
		const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
		if (debug || !quiet) _log("loading env from encrypted .env.vault");
		const parsed = DotenvModule._parseVault(options);
		let processEnv = process.env;
		if (options && options.processEnv != null) processEnv = options.processEnv;
		DotenvModule.populate(processEnv, parsed, options);
		return { parsed };
	}
	function configDotenv(options) {
		const dotenvPath = path$1.resolve(process.cwd(), ".env");
		let encoding = "utf8";
		let processEnv = process.env;
		if (options && options.processEnv != null) processEnv = options.processEnv;
		let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
		let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
		if (options && options.encoding) encoding = options.encoding;
		else if (debug) _debug("no encoding is specified (UTF-8 is used by default)");
		let optionPaths = [dotenvPath];
		if (options && options.path) if (!Array.isArray(options.path)) optionPaths = [_resolveHome(options.path)];
		else {
			optionPaths = [];
			for (const filepath of options.path) optionPaths.push(_resolveHome(filepath));
		}
		let lastError;
		const parsedAll = {};
		for (const path of optionPaths) try {
			const parsed = DotenvModule.parse(fs.readFileSync(path, { encoding }));
			DotenvModule.populate(parsedAll, parsed, options);
		} catch (e) {
			if (debug) _debug(`failed to load ${path} ${e.message}`);
			lastError = e;
		}
		const populated = DotenvModule.populate(processEnv, parsedAll, options);
		debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
		quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
		if (debug || !quiet) {
			const keysCount = Object.keys(populated).length;
			const shortPaths = [];
			for (const filePath of optionPaths) try {
				const relative = path$1.relative(process.cwd(), filePath);
				shortPaths.push(relative);
			} catch (e) {
				if (debug) _debug(`failed to load ${filePath} ${e.message}`);
				lastError = e;
			}
			_log(`injected env (${keysCount}) from ${shortPaths.join(",")} ${dim(`// tip: ${_getRandomTip()}`)}`);
		}
		if (lastError) return {
			parsed: parsedAll,
			error: lastError
		};
		else return { parsed: parsedAll };
	}
	function config(options) {
		if (_dotenvKey(options).length === 0) return DotenvModule.configDotenv(options);
		const vaultPath = _vaultPath(options);
		if (!vaultPath) {
			_warn(`you set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}`);
			return DotenvModule.configDotenv(options);
		}
		return DotenvModule._configVault(options);
	}
	function decrypt(encrypted, keyStr) {
		const key = Buffer.from(keyStr.slice(-64), "hex");
		let ciphertext = Buffer.from(encrypted, "base64");
		const nonce = ciphertext.subarray(0, 12);
		const authTag = ciphertext.subarray(-16);
		ciphertext = ciphertext.subarray(12, -16);
		try {
			const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
			aesgcm.setAuthTag(authTag);
			return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
		} catch (error) {
			const isRange = error instanceof RangeError;
			const invalidKeyLength = error.message === "Invalid key length";
			const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
			if (isRange || invalidKeyLength) {
				const err = /* @__PURE__ */ new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
				err.code = "INVALID_DOTENV_KEY";
				throw err;
			} else if (decryptionFailed) {
				const err = /* @__PURE__ */ new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
				err.code = "DECRYPTION_FAILED";
				throw err;
			} else throw error;
		}
	}
	function populate(processEnv, parsed, options = {}) {
		const debug = Boolean(options && options.debug);
		const override = Boolean(options && options.override);
		const populated = {};
		if (typeof parsed !== "object") {
			const err = /* @__PURE__ */ new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
			err.code = "OBJECT_REQUIRED";
			throw err;
		}
		for (const key of Object.keys(parsed)) if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
			if (override === true) {
				processEnv[key] = parsed[key];
				populated[key] = parsed[key];
			}
			if (debug) if (override === true) _debug(`"${key}" is already defined and WAS overwritten`);
			else _debug(`"${key}" is already defined and was NOT overwritten`);
		} else {
			processEnv[key] = parsed[key];
			populated[key] = parsed[key];
		}
		return populated;
	}
	var DotenvModule = {
		configDotenv,
		_configVault,
		_parseVault,
		config,
		decrypt,
		parse,
		populate
	};
	module.exports.configDotenv = DotenvModule.configDotenv;
	module.exports._configVault = DotenvModule._configVault;
	module.exports._parseVault = DotenvModule._parseVault;
	module.exports.config = DotenvModule.config;
	module.exports.decrypt = DotenvModule.decrypt;
	module.exports.parse = DotenvModule.parse;
	module.exports.populate = DotenvModule.populate;
	module.exports = DotenvModule;
}));
//#endregion
//#region node_modules/dotenv/lib/env-options.js
var require_env_options = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var options = {};
	if (process.env.DOTENV_CONFIG_ENCODING != null) options.encoding = process.env.DOTENV_CONFIG_ENCODING;
	if (process.env.DOTENV_CONFIG_PATH != null) options.path = process.env.DOTENV_CONFIG_PATH;
	if (process.env.DOTENV_CONFIG_QUIET != null) options.quiet = process.env.DOTENV_CONFIG_QUIET;
	if (process.env.DOTENV_CONFIG_DEBUG != null) options.debug = process.env.DOTENV_CONFIG_DEBUG;
	if (process.env.DOTENV_CONFIG_OVERRIDE != null) options.override = process.env.DOTENV_CONFIG_OVERRIDE;
	if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
	module.exports = options;
}));
//#endregion
//#region node_modules/dotenv/lib/cli-options.js
var require_cli_options = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
	module.exports = function optionMatcher(args) {
		const options = args.reduce(function(acc, cur) {
			const matches = cur.match(re);
			if (matches) acc[matches[1]] = matches[2];
			return acc;
		}, {});
		if (!("quiet" in options)) options.quiet = "true";
		return options;
	};
}));
//#endregion
//#region node_modules/dotenv/config.js
(function() {
	require_main().config(Object.assign({}, require_env_options(), require_cli_options()(process.argv)));
})();
//#endregion
//#region src/services/auth/ApiAuthRepository.ts
var ApiAuthRepository = class {
	apiUrl = `${process.env.VITE_API_BASE_URL || "http://localhost:3002/api"}/auth`;
	async login(email, password) {
		try {
			const response = await fetch(`${this.apiUrl}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					password
				})
			});
			const data = await response.json();
			if (!response.ok) return {
				success: false,
				error: data.error || "Falha no login"
			};
			return {
				success: true,
				token: data.token,
				user: data.user
			};
		} catch (error) {
			return {
				success: false,
				error: "Erro ao conectar à API"
			};
		}
	}
	async register(name, email, password, signatureBase64) {
		try {
			const response = await fetch(`${this.apiUrl}/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					email,
					password,
					signatureBase64
				})
			});
			const data = await response.json();
			if (!response.ok) return {
				success: false,
				error: data.error || "Falha no registro"
			};
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: "Erro ao conectar à API"
			};
		}
	}
};
//#endregion
//#region src/domain/auth/AuthService.ts
var AuthService = class {
	authRepository;
	constructor(authRepository) {
		this.authRepository = authRepository;
	}
	async login(email, password) {
		if (!email || !password) return {
			success: false,
			error: "E-mail e senha são obrigatórios"
		};
		return this.authRepository.login(email, password);
	}
	async register(name, email, password, signatureBase64) {
		if (!name || !email || !password) return {
			success: false,
			error: "Todos os campos são obrigatórios"
		};
		return this.authRepository.register(name, email, password, signatureBase64);
	}
};
//#endregion
//#region src/services/calibration/ApiCalibrationRepository.ts
var ApiCalibrationRepository = class {
	apiUrl = `${process.env.VITE_API_BASE_URL || "http://localhost:3002/api"}/calibration`;
	async save(data) {
		try {
			const response = await fetch(this.apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			});
			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.error || `Falha ao salvar na API: ${response.statusText}`);
			}
			const result = await response.json();
			console.log("Resposta da API:", result);
			return result.data || result;
		} catch (error) {
			console.error("Erro de rede ao salvar na API:", error);
			throw error;
		}
	}
	async getByEquipmentId(equipmentId) {
		try {
			const response = await fetch(`${this.apiUrl}/equipment/${equipmentId}`);
			if (!response.ok) throw new Error(`Falha ao buscar histórico: ${response.statusText}`);
			return (await response.json()).data;
		} catch (error) {
			console.error("Erro ao buscar histórico de calibração:", error);
			throw error;
		}
	}
	async updateHeader(id, clientId, createdAt) {
		try {
			const response = await fetch(`${this.apiUrl}/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					clientId,
					createdAt
				})
			});
			if (!response.ok) {
				const errData = await response.json();
				throw new Error(errData.error || `Falha ao atualizar cabeçalho: ${response.statusText}`);
			}
			return await response.json();
		} catch (error) {
			console.error("Erro de rede ao atualizar cabeçalho de calibração:", error);
			throw error;
		}
	}
};
//#endregion
//#region src/services/equipments/ApiEquipmentsRepository.ts
var ApiEquipmentsRepository = class {
	apiUrl = `${process.env.VITE_API_BASE_URL || "http://localhost:3002/api"}/equipments`;
	async getAll() {
		const response = await fetch(this.apiUrl);
		if (!response.ok) throw new Error("Falha ao buscar equipamentos");
		return (await response.json()).data;
	}
	async create(op, ns, name, equipmentType, measurementRange) {
		const response = await fetch(this.apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				op,
				ns,
				name,
				equipment_type: equipmentType,
				measurement_range: measurementRange
			})
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Falha ao cadastrar equipamento");
		return data.data;
	}
	async update(id, op, ns, name, equipmentType, measurementRange) {
		const response = await fetch(`${this.apiUrl}/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				op,
				ns,
				name,
				equipment_type: equipmentType,
				measurement_range: measurementRange
			})
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Falha ao atualizar equipamento");
		return data;
	}
	async delete(id) {
		if (!(await fetch(`${this.apiUrl}/${id}`, { method: "DELETE" })).ok) throw new Error("Falha ao excluir equipamento");
	}
};
//#endregion
//#region src/services/clients/ApiClientsRepository.ts
var ApiClientsRepository = class {
	apiUrl = `${process.env.VITE_API_BASE_URL || "http://localhost:3002/api"}/clients`;
	async getAll() {
		const response = await fetch(this.apiUrl);
		if (!response.ok) throw new Error("Falha ao buscar clientes");
		return (await response.json()).data;
	}
	async create(company, cnpj, email, adress, city) {
		const response = await fetch(this.apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				company,
				cnpj,
				email,
				adress,
				city
			})
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Falha ao cadastrar cliente");
		return data.data;
	}
	async update(id, company, cnpj, email, adress, city) {
		const response = await fetch(`${this.apiUrl}/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				company,
				cnpj,
				email,
				adress,
				city
			})
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Falha ao atualizar cliente");
		return data;
	}
	async delete(id) {
		if (!(await fetch(`${this.apiUrl}/${id}`, { method: "DELETE" })).ok) throw new Error("Falha ao excluir cliente");
	}
};
//#endregion
//#region src/services/templates/ApiTemplatesRepository.ts
var ApiTemplatesRepository = class {
	apiUrl = `${process.env.VITE_API_BASE_URL || "http://localhost:3002/api"}/templates`;
	async getAll() {
		const response = await fetch(this.apiUrl);
		if (!response.ok) throw new Error("Falha ao buscar templates");
		return (await response.json()).data;
	}
	async getById(id) {
		const response = await fetch(`${this.apiUrl}/${id}`);
		if (!response.ok) throw new Error("Falha ao buscar template");
		const template = (await response.json()).data;
		if (typeof template.structure === "string") template.structure = JSON.parse(template.structure);
		return template;
	}
	async create(template) {
		const response = await fetch(this.apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(template)
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Falha ao cadastrar template");
		return data.data;
	}
	async update(id, template) {
		const response = await fetch(`${this.apiUrl}/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(template)
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Falha ao atualizar template");
		return data.data;
	}
	async delete(id) {
		const response = await fetch(`${this.apiUrl}/${id}`, { method: "DELETE" });
		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || "Falha ao excluir template");
		}
	}
};
//#endregion
//#region src/services/standards/ApiStandardsRepository.ts
var ApiStandardsRepository = class {
	apiUrl = `${process.env.VITE_API_BASE_URL || "http://localhost:3002/api"}/standards`;
	async getAll() {
		try {
			const response = await fetch(this.apiUrl);
			if (!response.ok) throw new Error("Falha ao buscar padrões");
			return await response.json();
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	async getById(id) {
		try {
			const response = await fetch(`${this.apiUrl}/${id}`);
			if (!response.ok) throw new Error("Falha ao buscar padrão por ID");
			return await response.json();
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	async create(standard) {
		try {
			const response = await fetch(this.apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(standard)
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || "Falha ao criar padrão");
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	async update(id, standard) {
		try {
			const response = await fetch(`${this.apiUrl}/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(standard)
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || "Falha ao atualizar padrão");
			return data;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	async delete(id) {
		try {
			if (!(await fetch(`${this.apiUrl}/${id}`, { method: "DELETE" })).ok) throw new Error("Falha ao excluir padrão");
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
};
//#endregion
//#region src/services/dashboard/ApiDashboardRepository.ts
var ApiDashboardRepository = class {
	apiUrl = `${process.env.VITE_API_BASE_URL || "http://localhost:3002/api"}/dashboard`;
	async getMetrics(filters) {
		const params = new URLSearchParams();
		if (filters?.startDate) params.append("startDate", filters.startDate);
		if (filters?.endDate) params.append("endDate", filters.endDate);
		if (filters?.equipmentType) params.append("equipmentType", filters.equipmentType);
		const queryStr = params.toString() ? `?${params.toString()}` : "";
		const response = await fetch(`${this.apiUrl}/metrics${queryStr}`);
		if (!response.ok) throw new Error("Falha ao buscar métricas da dashboard");
		return (await response.json()).data;
	}
};
//#endregion
//#region electron/main.ts
process.env.DIST = node_path.default.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : node_path.default.join(process.env.DIST, "../public");
var win;
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var authService = new AuthService(new ApiAuthRepository());
var calibrationRepository = new ApiCalibrationRepository();
var equipmentsRepository = new ApiEquipmentsRepository();
var clientsRepository = new ApiClientsRepository();
var templatesRepository = new ApiTemplatesRepository();
var standardsRepository = new ApiStandardsRepository();
var dashboardRepository = new ApiDashboardRepository();
electron.ipcMain.handle("auth:login", async (_, email, password) => {
	return authService.login(email, password);
});
electron.ipcMain.handle("auth:register", async (_, name, email, password, signatureBase64) => {
	return authService.register(name, email, password, signatureBase64);
});
electron.ipcMain.handle("calibration:save", async (_, data) => {
	return calibrationRepository.save(data);
});
electron.ipcMain.handle("calibration:getByEquipment", async (_, equipmentId) => {
	return calibrationRepository.getByEquipmentId(equipmentId);
});
electron.ipcMain.handle("calibration:updateHeader", async (_, id, clientId, createdAt) => {
	return calibrationRepository.updateHeader(id, clientId, createdAt);
});
electron.ipcMain.handle("equipments:getAll", async () => {
	return equipmentsRepository.getAll();
});
electron.ipcMain.handle("equipments:create", async (_, op, ns, name, equipmentType, measurementRange) => {
	return equipmentsRepository.create(op, ns, name, equipmentType, measurementRange);
});
electron.ipcMain.handle("equipments:update", async (_, id, op, ns, name, equipmentType, measurementRange) => {
	return equipmentsRepository.update(id, op, ns, name, equipmentType, measurementRange);
});
electron.ipcMain.handle("equipments:delete", async (_, id) => {
	return equipmentsRepository.delete(id);
});
electron.ipcMain.handle("clients:getAll", async () => {
	return clientsRepository.getAll();
});
electron.ipcMain.handle("clients:create", async (_, company, cnpj, email, adress, city) => {
	return clientsRepository.create(company, cnpj, email, adress, city);
});
electron.ipcMain.handle("clients:update", async (_, id, company, cnpj, email, adress, city) => {
	return clientsRepository.update(id, company, cnpj, email, adress, city);
});
electron.ipcMain.handle("clients:delete", async (_, id) => {
	return clientsRepository.delete(id);
});
electron.ipcMain.handle("templates:getAll", async () => {
	return templatesRepository.getAll();
});
electron.ipcMain.handle("templates:getById", async (_, id) => {
	return templatesRepository.getById(id);
});
electron.ipcMain.handle("templates:create", async (_, template) => {
	return templatesRepository.create(template);
});
electron.ipcMain.handle("templates:update", async (_, id, template) => {
	return templatesRepository.update(id, template);
});
electron.ipcMain.handle("templates:delete", async (_, id) => {
	return templatesRepository.delete(id);
});
electron.ipcMain.handle("standards:getAll", async () => {
	return standardsRepository.getAll();
});
electron.ipcMain.handle("standards:getById", async (_, id) => {
	return standardsRepository.getById(id);
});
electron.ipcMain.handle("standards:create", async (_, standard) => {
	const res = await standardsRepository.create(standard);
	win?.webContents.send("standards:updated");
	return res;
});
electron.ipcMain.handle("standards:update", async (_, id, standard) => {
	const res = await standardsRepository.update(id, standard);
	win?.webContents.send("standards:updated");
	return res;
});
electron.ipcMain.handle("standards:delete", async (_, id) => {
	const res = await standardsRepository.delete(id);
	win?.webContents.send("standards:updated");
	return res;
});
electron.ipcMain.handle("dashboard:getMetrics", async (_, filters) => {
	return dashboardRepository.getMetrics(filters);
});
function createWindow() {
	win = new electron.BrowserWindow({
		width: 1600,
		height: 768,
		icon: node_path.default.join(__dirname, "../src/assets/logo-calibracao-lhf.png"),
		title: "Calibração LHF",
		webPreferences: {
			preload: node_path.default.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
	else win.loadFile(node_path.default.join(process.env.DIST, "index.html"));
}
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		electron.app.quit();
		win = null;
	}
});
electron.app.whenReady().then(createWindow);
//#endregion
