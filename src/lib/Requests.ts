import { isObj, formdata_to_obj, obj_to_formdata, extend } from "utils/helpers";
import { isArray } from "util";
import { Session } from "lib/Session";
import { warn, log, debug } from "utils/console";
import { API_PATH } from "utils/symbols";

enum request_methods {
    get = "GET",
    post = "POST",
    put = "PUT",
    del = "DELETE",
}

interface RequestOptions {
    responseType?: XMLHttpRequestResponseType,
    externalRequest?: boolean
    url_parameters?: any
}

type RequestsResponse = {
    xhr: XMLHttpRequest;
    status: number;
    output?: any;
    error_message?: string;
    raw_response: any;
};

type APIResponse = {
    error?: string;
    status: number;
    output: any;
};

class Requests {
    private static _instance: Requests = new Requests();
    private constructor() {
        // Decide if we're creating an instance or not
        if (Requests._instance) {
            return Requests._instance;
        }
        Requests._instance = this;
    }
    public static getInstance() {
        return Requests._instance;
    }

    async_request(method: request_methods, url: string, data?: any, options: RequestOptions = {}): Promise<RequestsResponse> {
        return new Promise(function async_request_promise(resolve, reject) {
            const xhr: XMLHttpRequest = new XMLHttpRequest();

            if (options.responseType) {
                xhr.responseType = options.responseType;
            }

            if (!options.externalRequest && url.search(/^(http|https)?\:\/\//i) === -1) {
                url = url[0] === '/' ? `${API_PATH}${url}` : `${API_PATH}/${url}`;
            }

            if (options.url_parameters) {
                url += url.indexOf('?') > -1 ? '&' : '?';
                url += obj_to_formdata(options.url_parameters);
                debug("Has parameters", options.url_parameters, url);
            }

            xhr.open(method, url);

            if (Session.user.session_token) {
                xhr.setRequestHeader("session-token", Session.user.session_token);
            } else {
                var token = window.localStorage.getItem("session_token");
                if (token) {
                    xhr.setRequestHeader("session-token", token);
                } else {
                    warn("No session-token");
                }
            }
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== xhr.DONE)
                    return;

                var response: RequestsResponse = {
                    xhr,
                    status: xhr.status,
                    raw_response: undefined
                };

                var content_type = xhr.getResponseHeader("content-type");
                debug("Received response", content_type);
                if (content_type.indexOf("json") >= 0 && xhr.response.length > 0) {
                    response.raw_response = <APIResponse>JSON.parse(xhr.response);

                    if (xhr.status > 299) {
                        response.error_message = response.raw_response.error;
                    } else {
                        response.output = response.raw_response.output;
                    }

                } else if (xhr.status > 299) {
                    response.error_message = xhr.statusText;
                } else {
                    response.raw_response = xhr.response;
                }
                debug("resolving request");
                resolve(response);
            }

            xhr.onerror = () => {
                var response: RequestsResponse;
                response.xhr = xhr;
                response.status = xhr.status;
                var content_type = xhr.getResponseHeader("content-type");
                if (xhr.responseText.length > 0 && content_type.indexOf("json") >= 0) {
                    response.raw_response = JSON.parse(xhr.responseText);
                    response.error_message = response.raw_response.error;
                }
                // Always resolve, error checking should be done on consistent output
                debug("XHR errored, resolving");
                resolve(response);
            }

            if (data instanceof FormData) {
                //xhr.setRequestHeader("Content-Type", "multipart/form-data");
            } else {
                if (!(data instanceof FormData) && (isObj(data) || isArray(data))) {
                    data = JSON.stringify(data);
                }
                xhr.setRequestHeader("Content-Type", "application/json");
            }

            xhr.send(data);
        });
    }

    get(url: string, data?: any, opts?: RequestOptions): Promise<RequestsResponse> {
        if (data && (!opts || !opts.url_parameters)) {
            opts = extend(opts || {}, { url_parameters: data });
        }
        return this.async_request(request_methods.get, url, data, opts);
    }

    post(url: string, data?: any, opts?: RequestOptions): Promise<RequestsResponse> {
        return this.async_request(request_methods.post, url, data, opts);
    }

    put(url: string, data?: any, opts?: RequestOptions): Promise<RequestsResponse> {
        return this.async_request(request_methods.put, url, data, opts);
    }

    del(url: string, data?: any, opts?: RequestOptions): Promise<RequestsResponse> {
        return this.async_request(request_methods.del, url, data, opts);
    }

}

export default Requests.getInstance();