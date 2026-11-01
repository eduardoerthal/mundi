import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorView } from '../components/ErrorView';
import { FlagImage } from '../components/FlagImage';
import { InfoRow } from '../components/InfoRow';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFetch } from '../hooks/useFetch';
import { AppStackScreenProps } from '../navigation/types';
import { getByCode, getNeighbors } from '../services/countriesService';
import { colors } from '../theme/colors';
import { cardShadow, fontSize, radius, spacing, TOUCH_MIN } from '../theme/spacing';
import { formatArea, formatList, formatNumber, regionLabel } from '../utils/format';

type Props = AppStackScreenProps<'Details'>;

export function DetailsScreen({ route, navigation }: Props) {
  const { code } = route.params;

  const { data: country, loading, error, refetch } = useFetch(
    (signal) => getByCode(code, signal),
    [code],
  );

  // Vizinhos só são buscados quando o país tem fronteiras.
  const hasBorders = (country?.borders.length ?? 0) > 0;
  const neighbors = useFetch(
    (signal) => (hasBorders ? getNeighbors(code, signal) : Promise.resolve([])),
    [code, hasBorders],
  );

  useEffect(() => {
    if (country) navigation.setOptions({ title: country.name });
  }, [navigation, country]);

  const openNeighbor = useCallback(
    (neighborCode: string) => navigation.push('Details', { code: neighborCode }),
    [navigation],
  );

  if (loading) return <LoadingView message="Carregando detalhes…" />;
  if (error) {
    return (
      <ErrorView
        title={error.kind === 'notFound' ? 'País não encontrado' : undefined}
        message={error.message}
        onRetry={error.kind === 'notFound' ? undefined : refetch}
      />
    );
  }
  if (!country) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <FlagImage
        uri={country.flagUrl}
        countryName={country.name}
        description={country.flagDescription}
        size="large"
        style={styles.flag}
      />

      <Text style={styles.title} accessibilityRole="header">
        {country.name}
      </Text>
      <Text style={styles.subtitle}>{country.officialName}</Text>

      <View style={styles.card}>
        <InfoRow icon="business-outline" label="Capital" value={country.capital ?? 'Não informado'} />
        <InfoRow icon="globe-outline" label="Região" value={regionLabel(country.region)} />
        <InfoRow icon="map-outline" label="Sub-região" value={country.subregion ?? 'Não informado'} />
        <InfoRow icon="people-outline" label="População" value={formatNumber(country.population)} />
        <InfoRow icon="resize-outline" label="Área" value={formatArea(country.area)} />
        <InfoRow icon="chatbubbles-outline" label="Idiomas" value={formatList(country.languages)} />
        <InfoRow icon="cash-outline" label="Moedas" value={formatList(country.currencies)} />
        <InfoRow icon="time-outline" label="Fusos horários" value={formatList(country.timezones)} />
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        Países vizinhos
      </Text>
      {!hasBorders ? (
        <Text style={styles.muted}>Este país não tem fronteiras terrestres.</Text>
      ) : neighbors.loading ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando países vizinhos" />
      ) : neighbors.error || !neighbors.data ? (
        // Sem os nomes, mostra ao menos os códigos que vieram no detalhe.
        <Text style={styles.muted}>{country.borders.join(', ')}</Text>
      ) : (
        <View style={styles.chips}>
          {neighbors.data.map((neighbor) => (
            <Pressable
              key={neighbor.code}
              onPress={() => openNeighbor(neighbor.code)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={neighbor.name}
              accessibilityHint="Abre os detalhes deste país vizinho"
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            >
              <Text style={styles.chipText}>{neighbor.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {country.mapsUrl ? (
        <View style={styles.mapButton}>
          <PrimaryButton
            title="Ver no mapa"
            icon="navigate-outline"
            variant="outline"
            onPress={() => Linking.openURL(country.mapsUrl as string)}
            accessibilityHint="Abre o mapa em outro aplicativo"
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  flag: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  card: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...cardShadow,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: TOUCH_MIN,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  mapButton: {
    marginTop: spacing.xl,
  },
});
