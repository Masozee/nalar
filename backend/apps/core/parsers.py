import orjson
from rest_framework.parsers import BaseParser
from rest_framework.exceptions import ParseError


class ORJSONParser(BaseParser):
    """Fast JSON parser using orjson."""

    media_type = 'application/json'

    def parse(self, stream, media_type=None, parser_context=None):
        try:
            data = stream.read()
            if not data:
                return {}
            return orjson.loads(data)
        except orjson.JSONDecodeError as exc:
            raise ParseError(f'JSON parse error: {exc}')
