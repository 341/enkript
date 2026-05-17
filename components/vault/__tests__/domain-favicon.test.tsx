import { render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';

import { DomainFavicon } from '@/components/vault/domain-favicon';

describe('DomainFavicon', () => {
  it('shows favicon image when url is valid', () => {
    const { UNSAFE_getByType } = render(<DomainFavicon url="https://github.com" />);
    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({
      uri: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
    });
  });

  it('falls back to globe icon when url is missing', () => {
    render(<DomainFavicon url="" />);
    expect(screen.queryByRole('image')).toBeNull();
    expect(screen.getByLabelText('Globe')).toBeTruthy();
  });
});
